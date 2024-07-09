## Description

This API mainly focus on parsing email files (`.eml`) to return JSON content for the following scenarios:

1. Email content has a JSON attachment.
2. Email content has a link that returns the JSON data.
3. Email content has a link to a website that contains another link to the actual JSON data.

### Stack and libraries

- Node.js 20
- NestJS v10
- mailparser
- jsdom
- axios

### Known limitations and assumptions

1. Attachments have priority over links. If there are attachments in the email, but none of them is JSON, it will throw an error, even if the email HTML content has a link for scenarios 2 or 3.
2. The endpoint will return the first JSON like data found. If there are two or more attachments (or links) that have JSON data, only the first one will be returned.
3. For processing local files, there is a `data` folder in the root directory of the project. All email files that you want to test should be put in there, as the application limits its search to that specific directory.
4. I did not add OpenAPI documentation as there is mostly a single endpoint of interest, and it is easily testable using the web browser (HTTP GET for the win!)
5. When fetching the content for email links that point to a website, no scripts will be executed. If the visibility of the link depends on executing scipts, it will not work. If you want to test the `nested link` behavior, you can use the `nested-json-link.eml` file provided.

## How to test the APP

The application is deployed at https://mail-parser-api.onrender.com/. Unfortunately, I'm using the free tier, which means that the application shuts down after a period of inactivity. Try access the URL provided above and please have a little bit of patience the first time while it starts.

Now, to the point. The endpoint you probably want to test is `https://mail-parser-api.onrender.com/email-parser?source=` where source can be a filename (or path) or a full URL. There are a couple of files in the `data` directory of the repository that you could use to test the functionality. For instance: `https://raw.githubusercontent.com/kevinv519/mail-parser-api/main/data/email-with-json-attachment.eml`. Or you could provide one of your own.

Other resources you could use to test different scenarios:

- `email-with-json-attachment.eml` -> success response with data
- `email-with-json-link.eml` -> success response with same data as the first one
- `nested-json-link.eml` -> success response with some JSON data (different from the former because of the actual HTML content for the nested link)
- `pdf-attachment.eml` -> 422 response because attachment is of type PDF
- `no-json-links.eml` -> 422 response because email content does not have links that return JSON data. And the nested content of those links also do not return JSON data.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

I have added strong unit tests for the Processors and the EmailParserService. Make sure to check out the test coverage 😉

```bash
# unit tests
$ npm run test


# test coverage
$ npm run test:cov
```

## Facts you may find interesting

- You'll probably notice that I'm using the strategy pattern for the processors! It is super easy to extend the functionality for more scenarios, if needed.
- JSDOM does not execute any scripts by default, so where are safe from any malicious attack.
