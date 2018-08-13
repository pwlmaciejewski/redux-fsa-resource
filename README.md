# redux-fsa-resource

Lightweight resource management for [Redux](https://redux.js.org/).
It uses [Typescript-FSA](https://github.com/aikoven/typescript-fsa) under the hood.


## Installation

```
yarn add redux-fsa-resource
```


## Quick start

Create `resources.js` in your project:

```javascript
// resources.js

import createResource from 'redux-fsa-resource'

export const books = createResource('books')
export const authors = createResource('authors')
```

Wire up resources reducers:

```javascript
// reducers.js

import { combineReducers } from 'redux'
import { books, authors } from './resources'

export default combineReducers({
  books: books.reducer,
  authors: authors.reducer,
  // other reducers
})

```

Dispatch resource actions. [Redux-Thunk](https://github.com/reduxjs/redux-thunk) example:

```javascript
// actions.js

import { books } from './resources'

const getBook = (id) => async (dispatch, getState) => {
  dispatch(books.get.started(id))
  try {
    const book = await fetch(`http://example.com/api/books/${id}`)
    dispatch(books.get.done({
      params: id,
      result: book
    }))
  } catch (error) {
    dispatch(books.get.failed({
      params: id,
      error
    }))
  }
}

```

Display results

```javascript
// components/Book.js

import * as React from 'react'
import { getBook } from '../actions'
import { books } from '../resources'
import { connect } from 'react-redux'

const BOOK_ID = 1

class Book extends React.Component {
  componentDidMount () {
    this.props.getBook()
  }

  render () {
    const { book } = this.props.book
    if (book.request.pending) return <div>Loading...</div>
    if (book.request.error) return <div>Ooops... {book.request.error.message}</div>
    return (
      <h1>{book.resource.title}</h1>
      <h2>Author: {book.resource.author}</h2>
      <p>
        {book.resource.description}
      </p>
    )
  }
}

export default connect(
  state => ({
    book: state.books[BOOK_ID] || book.defaultResource(BOOK_ID)
  }), {
    getBook
  }
)

```


## Motivation

In real life data about the same resource can flow into your system in different ways. For example:

* `GET /book/:id` - returns `Book` with the given id
* `PUT /book/:id/title` - changes the title of the book with `id`, it returns updated `Book`

As you can see, both calls return the same resource, and you should be able to 
handle it easily.

The main idea of this library is to make `Resource<T>` a single source of truth for your application,
and disconnect it from the place it comes from. Resource is:
  
  * asynchronous - it can be in fetching state that can either succeed or fail with an error
  * parametrized - resources with the same (arbitrary) parameters are considered equal

Async state of the resource, implemented by `.get.start`, `.get.done` and `.get.failed`
methods is conceptually connected with abstract "fetching the resource". It doesn't make 
any assumptions on that matter; it's up to you to decide how and when (and if) fetch the resource. 
In real life, it **usually** means that you need to dispatch a new `GET` call to your backend API 
and handle the results.

That said, you are encouraged to use `.update` and `.delete` actions
to directly modify resources that are already in your store. So, in the above example where `PUT` method returns an updated resource state, you should update the store state.

```javascript
// actions.js

import { books, requests } from './resources'

const updateBookTitle = (id, title) => async (dispatch, getState) => {
  requests.get.started('updateBookTitle')
  try {
    const newBook = await fetch(`http://example.com/api/books/${id}/title`, { 
      method: 'PUT',
      body: title
    })
    dispatch(books.update({
      params: id,
      resouce: newBook
    }))
    dispatch(requests.get.done({ params: 'updateBookTitle' }))
  } catch (error) {
    dispatch(requests.get.failed({
      params: 'updateBookTitle',
      error
    }))
  }
}

```

In the example above `requests` is a resource of `Resource<void>` that makes
a nice representation of an async request when you don't want to persist the response.


## API

### `createResource(name: string): ResourceModule<R>`

Example:

```javascript
import createResource from 'redux-fsa-resource'

export books = createResource('books')
```


### `defaultResource(name: string, params: ResourceParams): Resource<R>`

Example:

```javascript
import { defaultResource } from 'redux-fsa-resource'

const book1 = defaultResource('book', 1)
```

Each resource has it's own instance of `defaultResource` method called `create`:

```javascript
import { books } from './resources'

const book1 = books.create(1)
```

### `resourceId(params: ResourceParams): string`

It generates resource id. Produces hash when `params` is an object.


## Models

### `Resource<R>`

```typescript
interface Resource<R> {
  id: string
  name: string
  params: ResourceParams
  request: AsyncRequest
  resource?: R
}
```

### `ResourceParams`

```typescript
type ResourceParams = object | number | string | boolean
```

### `AsyncRequest`

```typescript
interface AsyncRequest {
  pending: boolean
  success: boolean
  error?: Error
}
```

### `ResourceModule<R>`

```typescript
interface ResourceModule<R> {
  name: string
  create: (params: ResourceParams) => Resource<R>
  get: AsyncActionCreators<ResourceParams, R, Error>
  update: ActionCreator<UpdateResourceParams<R>>
  delete: ActionCreator<ResourceParams>
  createReducer: (innerReducer?: (state: Resources<R>, action: AnyAction) => Resources<R>) =>
    (state: Resources<R>, action: AnyAction) => Resources<R>
}
```
