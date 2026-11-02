# Simple Calculator

A small browser-based calculator served by a dependency-free Node.js HTTP server. It supports addition, subtraction, multiplication, and division. The calculator can be operated with the buttons or the keyboard.

## Requirements

- Node.js 20 or newer for running locally
- Docker for the container option

## Run locally

From the project directory:

```sh
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser. To use a different port, set `PORT` before starting:

```sh
PORT=8080 npm start
```

In PowerShell:

```powershell
$env:PORT=8080
npm start
```

## Run with Docker

Build the image:

```sh
docker build -t simple-calculator .
```

Start the container:

```sh
docker run --rm -p 3000:3000 --name simple-calculator simple-calculator
```

Then open [http://localhost:3000](http://localhost:3000). Stop it with `Ctrl+C`.

To run it in the background instead:

```sh
docker run -d --rm -p 3000:3000 --name simple-calculator simple-calculator
docker stop simple-calculator
```

## API

`POST /api/calculate` accepts JSON and returns the numeric result:

```json
{
  "left": 12,
  "operator": "*",
  "right": 3
}
```

Supported operators are `+`, `-`, `*`, and `/`. Invalid input and division by zero return an error response.

`GET /health` returns `{"status":"ok"}` and is used by the Docker health check.
