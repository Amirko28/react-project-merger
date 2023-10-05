# React Project Merger

`react-project-merger` is a simple CLI for merging existing react projects into one using [React Router](https://github.com/remix-run/react-router). Pleate note that the CLI **does not** modify the existing projects!

## Why does this exist?

In microfrontend architecture, sometimes you want to merge existing microfrontends into one to improve the ability to manage your microfrontends.

## Usage

### Using NPX

You can call the CLI using `npx`:

```console
npx react-project-merger -p app1 app2 -o merged
```

### Installing it locally

You can also run it as a global package:

```console
pnpm install @amirko28/react-project-merger
pnpm react-project-merger -p app1 app2 -o merged
```

## Flags

You can pass additional flags:

| Flag                     | Mandatory | Description                                            |
| ------------------------ | --------- | ------------------------------------------------------ |
| -p --paths <paths...>    | ✅        | The given projects' paths                              |
| -o --output <output>     | ✅        | The merged project path                                |
| -i --input <inputPath>   | ❌        | Input file (for passing args)                          |
| -f --force               | ❌        | Force merged directory overwrite                       |
| --javascript             | ❌        | Generates a javascript merged project (default: false) |
| --app-file <appFilePath> | ❌        | The App component path in the given projects           |
| -V --version             | ❌        | The CLI version                                        |
| -h --help                | ❌        | Prints help                                            |

## Input file example

```json
{
    "paths": ["src1", "src2"],
    "output": "merged",
    "debug": false,
    "force": true
}
```

And run:

```console
npx react-project-merger -i input.json
```
