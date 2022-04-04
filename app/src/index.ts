import { WHIPClient, WHIPClientIceServer } from "@eyevinn/whip-web-client";

const { NODE_ENV } = process.env;

let EndpointUrl = "http://localhost:8000/api/v1/whip/broadcaster";

if (NODE_ENV !== "development") {
  EndpointUrl = process.env.WHIP_ENDPOINT_URL;
}

function isClipboardAvailable() {
  return !!navigator.clipboard;
}

function base64encode(input: string) {
  const buf = Buffer.from(input);
  return buf.toString("base64");
}

window.addEventListener("DOMContentLoaded", async () => {
  document.querySelector<HTMLButtonElement>("#start").addEventListener("click", async () => {
    const videoElement = document.querySelector<HTMLVideoElement>("#webcast");
    const client = new WHIPClient({
      endpoint: EndpointUrl,
      element: videoElement,
      opts: { authkey: process.env.API_KEY, iceConfigFromEndpoint: true }
    });
  
    await client.connect();
    const resourceUri = await client.getResourceUri();
    const response = await fetch(resourceUri);
    if (response.ok) {
      const json = await response.json();
      if (json.channel) {
        const inputElement = document.querySelector<HTMLInputElement>("#share-link");
        const watchHostUrl = new URL(window.location.href);
        watchHostUrl.pathname = "/watch.html";
        watchHostUrl.searchParams.set("locator", base64encode(json.channel));
        inputElement.value = watchHostUrl.href;
      }
      const shareSection = document.querySelector<HTMLTableSectionElement>("#section-share");
      shareSection.classList.remove("section-share-hidden");
      shareSection.classList.add("section-share");  
    }
  });

  document.querySelector<HTMLButtonElement>("#share").addEventListener("click", async () => {
    const watchUrl = document.querySelector<HTMLInputElement>("#share-link").value;
    try {
      await navigator.share({ url: watchUrl });
    } catch (err) {
      // share not supported, copy to clipboard instead
      if (isClipboardAvailable()) {
        await navigator.clipboard.writeText(watchUrl);
        document.querySelector<HTMLParagraphElement>("#message").innerHTML = "URL copied to clipboard";
      }
    }
  });
});