<script setup lang="ts"></script>

<template>
  <div class="about">
    <div class="content">
      <h2>About SHC Graphic Resource Web Viewer</h2>

      <section class="section">
        <h3>Summary</h3>
        <p>
          This web application at the moment allows you to import and view TGX
          graphic files (used in Stronghold Crusader) and other web-supported
          image formats. Additionally, all imported files can then be exported
          as a valid TGX useable in the game.
        </p>
        <p>
          All images are converted to simulate ARGB1555 color format for
          accurate preview.
        </p>
      </section>

      <section class="section">
        <h3>Status</h3>
        <p class="warning">
          ⚠️ This application is currently under development. Features are not
          yet complete and may change. Some functionality may be limited or
          experimental.
        </p>
      </section>

      <section class="section">
        <h3>Tgx</h3>
        <p>
          Allows to import images and TGX files, view them, and export them as
          TGX files.
        </p>
      </section>

      <section class="section">
        <h3>View Controls</h3>
        <ul>
          <li>
            <strong>Mouse Zoom:</strong> Use mouse wheel to zoom in and out.
            Zooms toward the mouse cursor position. Scale range: 1x to 16x
            (powers of 2).
          </li>
          <li>
            <strong>Mouse Pan:</strong> Click and hold the middle mouse button
            to drag and pan around the image if the image is larger than the
            viewport.
          </li>
          <li>
            <strong>Keyboard Zoom:</strong> Press <strong>+</strong> to zoom in,
            <strong>-</strong> to zoom out. Zooms to center when using keyboard.
            Requires focus on the frame.
          </li>
          <li>
            <strong>Keyboard Pan:</strong> Use arrow keys (Up, Down, Left,
            Right) to pan around the image. Requires focus on the frame.
          </li>
        </ul>
      </section>

      <section class="section">
        <h3>Options</h3>
        <p>
          The Options tab provides several settings that affect different
          aspects of the application:
        </p>
        <ul>
          <li>
            <strong>View Options:</strong> Control the display of indicators in
            the viewer (scale, pixel, and position indicators).
          </li>
          <li>
            <strong>Upload Options:</strong> Configure image upload behavior,
            including the alpha threshold for determining transparency (0-255,
            determines transparency cutoff).
          </li>
          <li>
            <strong>Quantization Options:</strong> (Currently unused) Set the
            color distance formula and dithering method for color reduction.
          </li>
          <li>
            <strong>Coder Options:</strong> Adjust performance and encoding
            parameters including worker count (currently max. one used anyway),
            pixel repeat threshold, and padding alignment for TGX files.
          </li>
        </ul>
      </section>

      <section class="section">
        <h3>Special thanks</h3>
        <p>
          To the UCP team for the work on the
          <a href="https://unofficialcrusaderpatch.com/" target="_blank"
            >Unoffical Crusader Patch</a
          >
          and to
          <a href="https://fireflyworlds.com/" target="_blank"
            >Firefly Studios</a
          >
          for creating Stronghold Crusader.
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  color: var(--color-secondary);
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--color-secondary);
  padding-bottom: 0.5rem;
}

h3 {
  color: var(--color-secondary);
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.section {
  margin-bottom: 2rem;
}

p {
  color: var(--color-text);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.warning {
  background-color: color-mix(
    in srgb,
    var(--color-secondary-highlight),
    transparent 80%
  );
  padding: 1rem;
  border-left: 4px solid var(--color-secondary);
  border-radius: 0.25rem;
}

ul {
  color: var(--color-text);
  line-height: 1.8;
  padding-left: 1.5rem;
}

li {
  margin-bottom: 0.5rem;
}

strong {
  color: var(--color-secondary);
}

a {
  color: var(--color-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--color-secondary-highlight);
  text-decoration: underline;
}
</style>
