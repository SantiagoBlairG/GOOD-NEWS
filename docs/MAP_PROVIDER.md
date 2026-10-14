# Map provider decision
MapLibre GL JS is the renderer, lazy-loaded on visible Discover maps. It does not supply a tile-hosting entitlement.

Local development defaults to https://demotiles.maplibre.org/style.json. These are demonstration tiles, with visible attribution, and are not a production provider contract. Network/WebGL failure leaves a usable list.

Production candidate: MapTiler Cloud streets-v2 style. Supply VITE_MAPTILER_KEY in .env.local (public browser key, never a secret) and restrict allowed origins in the MapTiler dashboard. Retain required MapTiler/OpenStreetMap attribution. No production account or subscription was created. Choose a plan appropriate to traffic before deploying; current session/request quotas, commercial terms, costs, overage behavior, and attribution must be checked against the owner's selected plan. Do not rely on a free tier as unlimited service.

Recommended production option for a commercial MVP: MapTiler Cloud Flex with streets-v2. As checked October 14, 2026, Flex is USD $30/month, includes 500,000 API requests/month, and bills extra API requests at $0.15 per 1,000. It also includes 25,000 SDK sessions, but this app uses third-party MapLibre directly, so tile API requests are the relevant metric. Configure a spending limit and observe account analytics before launch. Free is $0 with 100,000 requests/month for prototyping/personal/non-commercial use and pauses when its quota is exhausted. No subscription was purchased. Recheck these mutable terms before production. [MapTiler pricing and request accounting](https://www.maptiler.com/cloud/pricing/).

Documentation checked: [browser key restrictions](https://docs.maptiler.com/guides/credentials/api-key/) and [MapTiler Cloud](https://www.maptiler.com/cloud/). Production approval is deferred with deployment.

Coordinates come only from fictional story locations. Identical coordinates are grouped into a single feature containing all story IDs. Clusters open all member stories and zoom. Global and unknown locations remain in lists. No geolocation.
