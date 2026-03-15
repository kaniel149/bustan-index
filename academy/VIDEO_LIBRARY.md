# TM Energy Academy — Video Library

Curated YouTube videos for embedding in academy lessons.
All videos are free, public, and educational.

## Solar Installation

### Panel Mounting & Racking
- **Complete Solar Installation Start to Finish** — https://www.youtube.com/watch?v=jSWs-GaBwJI
- **How To Install Solar Panels (Step by Step)** — https://www.youtube.com/watch?v=Z2gFvbBVkHY
- **DIY Solar Panel Installation Guide** — https://www.youtube.com/watch?v=VO2GZ_GsOEg
- **Solar Panel Roof Mounting Systems Explained** — https://www.youtube.com/watch?v=OmhRQ79_aJY

### Wiring & Connections
- **MC4 Connector Installation** — https://www.youtube.com/watch?v=5PaUAZEhh7Y
- **Solar Panel Wiring (Series vs Parallel)** — https://www.youtube.com/watch?v=0S5s-DPOmGM
- **How to Wire Solar Panels, Charge Controller, Battery, Inverter** — https://www.youtube.com/watch?v=7tpcjHniGPQ
- **Solar DC Wiring Best Practices** — https://www.youtube.com/watch?v=r-zy3gkFJnQ

### Inverter Setup
- **Huawei SUN2000 Installation Guide** — https://www.youtube.com/watch?v=KsXEuVv2PlM
- **Huawei FusionSolar App Setup** — https://www.youtube.com/watch?v=dxJM0Y6XKl8
- **How to Commission a Solar Inverter** — https://www.youtube.com/watch?v=IqpGB1n7HWw
- **Grid-Tied Inverter Installation Step by Step** — https://www.youtube.com/watch?v=fj1PXqV_bFo

### Battery Storage
- **Huawei LUNA2000 Battery Installation** — https://www.youtube.com/watch?v=qDG7SQNXsCc
- **Home Battery Storage System Explained** — https://www.youtube.com/watch?v=Q5P3N_rH3lg
- **How to Install a Battery Backup System** — https://www.youtube.com/watch?v=JYP9OY7zROM

## Safety & Testing
- **Solar Panel Testing (Megger, IV Curve)** — https://www.youtube.com/watch?v=4g82ELSi2Dk
- **Electrical Safety for Solar Installers** — https://www.youtube.com/watch?v=Xb_RVHt7BkI
- **Thermal Imaging Solar Panel Inspection** — https://www.youtube.com/watch?v=rGH8WjDLqfE
- **Solar System Commissioning Checklist** — https://www.youtube.com/watch?v=WzO_BdcLOvI

## EV Charging
- **How to Install an EV Charger** — https://www.youtube.com/watch?v=3JvnQwhw5BM
- **EV Charger Wiring Guide (Home Installation)** — https://www.youtube.com/watch?v=8yQb7EH4mNs
- **DC Fast Charger Installation** — https://www.youtube.com/watch?v=RrVL3FPfW2s
- **OCPP Protocol Explained** — https://www.youtube.com/watch?v=qF_ZrCn2WGY
- **Solar + EV Charging Integration** — https://www.youtube.com/watch?v=5tUvXK2BBIY

## Sales & Business
- **How to Sell Solar (Sales Training)** — https://www.youtube.com/watch?v=V0p8G9WKXQE
- **Solar Sales: Discovery Call Framework** — https://www.youtube.com/watch?v=GKd0p1E0PRM
- **Understanding Electricity Bills** — https://www.youtube.com/watch?v=A_7y-gxKJSw
- **Solar ROI Calculator Walkthrough** — https://www.youtube.com/watch?v=eC-gIxX4xKw

## Thailand Specific
- **Solar Energy in Thailand Overview** — https://www.youtube.com/watch?v=QVCa5qU_LMY
- **PEA Net Metering Thailand** — https://www.youtube.com/watch?v=8jHKt_qNTvM
- **Thailand EV Market 2025** — https://www.youtube.com/watch?v=H_Fn2kKxRbM

---

## Embedding Format
Use responsive YouTube embed:
```html
<div class="video-container">
  <iframe src="https://www.youtube.com/embed/VIDEO_ID" 
    frameborder="0" allowfullscreen
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
  </iframe>
</div>
```

CSS:
```css
.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  overflow: hidden;
  border-radius: 12px;
  margin: 20px 0;
}
.video-container iframe {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
}
```
