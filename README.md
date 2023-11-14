# bud-mkcert

**Use with Bud `^6.16.1`**

Provision local HTTPS certificates for the Bud.js HMR server via [`mkcert`](https://github.com/FiloSottile/mkcert).

This is useful for Laravel Valet users particularly.

This is an initial release, and although it does work, it's lacking documentation and advanced configuration features. These will be added soon - please feed back via the issue tracker if there's a specific feature you'd like implemented.

**:warning: If you're running Bud.js inside a VM (or WSL), then `mkcert` won't be able to magically traverse the boundary, jump into your physical machine, and install the CA cert. Although you'll have a self signed certificate installed on the HMR / dev server, you'll need to install the CA cert yourself. CA certs reside at `@storage/bud-mkcert-hmr.crt`**

## Install

`npm install bud-mkcert --save-dev` or `yarn add bud-mkcert -D`

## Requirements

*If you have installed Laravel Valet, you'll probably have `mkcert` already installed. Check by running `mkcert -CAROOT` in terminal. If you see a valid path, you're good to go.*

- [`mkcert`](https://github.com/FiloSottile/mkcert)
- `mkcert` CA installed. Run `mkcert -install` if unsure.
- A Bud.js project running `^6.16.1`

## How to use

1. Install the extension via `npm install bud-mkcert --save-dev` or `yarn add bud-mkcert -D`
2. Run `bud dev`

You should now see your HMR server is running with SSL enabled, using a self signed certificate.

