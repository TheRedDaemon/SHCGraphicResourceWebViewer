# SHC Graphic Resource Web Viewer

A web application for viewing and converting graphic files from Stronghold Crusader.

## Status

⚠️ This application is currently under development. Features are not yet complete and may change. Some functionality may be limited or experimental.

## Current Features

### TGX Support

- Import images (automatically reduced to ARGB1555) and TGX files
- View them with proper pixel scaling
- Export them as TGX files

## Live Demo

The application is hosted on GitHub Pages: [https://thereddaemon.github.io/SHCGraphicResourceWebViewer/](https://thereddaemon.github.io/SHCGraphicResourceWebViewer/)

## Local Development

### Prerequisites

- Node.js 24 or later
- npm

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/TheRedDaemon/SHCGraphicResourceWebViewer.git
   cd SHCGraphicResourceWebViewer
   ```

2. Install dependencies:

   ```bash
   npm ci
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

## Build

To build the application for production:

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Build the application:
   ```bash
   npm run build
   ```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Special Thanks

To the UCP team for the work on the [Unofficial Crusader Patch](https://unofficialcrusaderpatch.com/) and to [Firefly Studios](https://fireflyworlds.com/) for creating Stronghold Crusader.

## License

See [LICENSE](LICENSE) file for details.
