# AspirelIQ

Technical assessment for Operation Engineer

## Prerequisites

You need to have installed nodejs

## Installation

```bash
cd /AspirelIQ
npm install
```

## Usage

This project was made using the [Express Generator](https://expressjs.com/es/starter/generator.html), so this will be
used as a super simple RESTful API with only one endpoint, which is going to be `POST /dbms`

There is no requirements for authentication or authorization, you just need to be able to do `cURL` commands either
using softwares like `postman` or `insomnia` or your shell

To start the application, run the following on your shell:

```bash
npm run start
//Or you can use too:
npm run start:dev
```

When `npm run ...` command start it will start the node server at port `3000`

Then you will be able to start doing curl commands like this:

```bash
curl --location --request POST 'localhost:3000/dbms' \
--header 'Content-Type: application/json' \
--data-raw '{
    "document": {
        "_id": 1,
        "posts": []
    },
    "mutation": {
        "posts": [
            {"events": []}
            ]
    }
}'
```

## Parameters

This server has only one operation and that is `POST /dbms` and it receives a json as body with this params:

* document -> This is the document over the one you want to do operations
* mutation -> This will be the json containing all the operations that you want to do

Those are the only 2 parameters accepted and they are required, otherwise you'll get an error

## Operations

There 3 operations

NOTE: All these operations works the same way on deeper nodes!! so you can use same operations for
deeper nodes

* $ADD

```json
{
  "mutation": {
    "post": [
      {
        "title": "postTitle"
      }
    ]
  }
}
```

You can add multiple items to the same key adding more items to the array or if you add another item to the mutation
object specifying the right key, it will add it

* $UPDATE

```json
{
  "mutation": {
    "post": [
      {
        "_id": 1,
        "title": "newTitle"
      }
    ]
  }
}
```

Same as add you can do multiple operations if they are valid, the software will process them

* $DELETE

```json
{
  "mutation": {
    "post": [
      {
        "_id": 1,
        "_delete": true
      }
    ]
  }
}
```

Keep in mind that the order that you use for operating the original document will affect and probably
can create an error if at some point the item you are trying to update is deleted or modified

## Example
This is an example of the body that you could use for applying multiples operations to a document
```json
{
  "document": {
    "name": "document",
    "post": []
  },
  "mutation": {
    "post": [
      {
        "title": "post1"
      },
      {
        "title": "post2"
      },
      {
        "title": "post3'"
      },
      {
        "_id": 1, "title": "UpdatingTitleOnPost1"
      },
      { 
        "_id": 3, "_delete": true
      }
    ]
  }
}
```

## Response
This endpoint will response with a `statusCode: 200` and its response will be like this:
```json
{
    "traceAsString": [
        "{\"$ADD\":{\"posts\":{\"events\":[]}}}"
    ],
    "trace": [
        {
            "$ADD": {
                "posts": {
                    "events": []
                }
            }
        }
    ],
    "original": {
        "_id": 1,
        "posts": []
    },
    "updated": {
        "_id": 1,
        "posts": [
            {
                "_id": 1,
                "events": []
            }
        ]
    }
}
```
You will have 4 nodes, `traceAsString, trace, original, updated`
* `traceAsString` -> Array of strings with all the operations
* `trace` -> Array of json with all the operations
* `original` -> Document before all operations
* `updated` -> Document as result of all operations

