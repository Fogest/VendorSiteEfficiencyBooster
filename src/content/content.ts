(function () {
  // Create a floating button
  const button: HTMLButtonElement = document.createElement("button");
  button.textContent = "Open Image Editor";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.padding = "10px 15px";
  button.style.backgroundColor = "#007BFF";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "5px";
  button.style.zIndex = "10000";
  button.style.cursor = "pointer";

  document.body.appendChild(button);

  button.addEventListener("click", () => {
    const img: HTMLImageElement | null = document.querySelector(
      "#dform_widget_html_ahtm_ase_camera_incident_images > p > img"
    );

    // Get reference number from the page to use in direct URL for IR image
    const refNumber = document.querySelector(
      "#dform_ref_display > span"
    )?.textContent;

    // Load IR Image from the server (Direct URL)
    const irImgSrc =
      "https://waterlooqa.form.capreview.empro.verintcloudservices.com/api/private/getfile?ref=" +
      refNumber +
      "&filename=ir.jpg";

    if (!img) {
      alert("No image found.");
      return;
    }

    alert(irImgSrc);

    if (!irImgSrc) {
      alert("No IR image found.");
      return;
    }

    openImageEditor(img.src, irImgSrc);
  });

  function openImageEditor(imageUrl: string, irImageUrl: string): void {
    // Create popup
    const popup: HTMLDivElement = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.top = "0%";
    popup.style.left = "0%";
    popup.style.width = "96%";
    popup.style.height = "98%";
    popup.style.backgroundColor = "white";
    popup.style.border = "1px solid black";
    popup.style.zIndex = "10001";
    popup.style.overflow = "auto";
    document.body.appendChild(popup);

    // Add toggle button
    const toggleButton: HTMLButtonElement = document.createElement("button");
    toggleButton.textContent = "Switch Image";
    toggleButton.style.position = "absolute";
    toggleButton.style.top = "10px";
    toggleButton.style.left = "10px";
    toggleButton.style.zIndex = "10002";
    popup.appendChild(toggleButton);

    // Add image for editing
    const image: HTMLImageElement = new Image();
    image.src = imageUrl;
    image.style.position = "relative";
    image.style.display = "block";
    image.style.margin = "0 auto";
    popup.appendChild(image);

    // Add IR image for editing
    const irImage: HTMLImageElement = new Image();
    irImage.src = irImageUrl;
    irImage.style.position = "relative";
    irImage.style.display = "none";
    irImage.style.margin = "0 auto";
    popup.appendChild(irImage);

    let currentImage = image;

    toggleButton.addEventListener("click", () => {
      if (currentImage === image) {
        image.style.display = "none";
        irImage.style.display = "block";
        currentImage = irImage;
      } else {
        irImage.style.display = "none";
        image.style.display = "block";
        currentImage = image;
      }
    });

    addSelectionBox(popup, () => currentImage);
  }

  function addSelectionBox(
    container: HTMLElement,
    getCurrentImage: () => HTMLImageElement
  ): void {
    const selectorBox: HTMLDivElement = document.createElement("div");
    const boxWidth: number = 100;
    const boxHeight: number = 50;

    selectorBox.style.position = "absolute";
    selectorBox.style.border = "2px dashed red";
    selectorBox.style.width = `${boxWidth}px`;
    selectorBox.style.height = `${boxHeight}px`;
    selectorBox.style.cursor = "move";
    selectorBox.style.top = "10px";
    selectorBox.style.left = "10px";
    container.appendChild(selectorBox);

    let startX: number = 0,
      startY: number = 0;

    selectorBox.addEventListener("mousedown", (e: MouseEvent) => {
      startX = e.clientX - selectorBox.offsetLeft;
      startY = e.clientY - selectorBox.offsetTop;

      const onMouseMove = (e: MouseEvent) => {
        const x: number = Math.max(0, e.clientX - startX);
        const y: number = Math.max(0, e.clientY - startY);

        selectorBox.style.left = `${x}px`;
        selectorBox.style.top = `${y}px`;
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    // Add save button
    const saveButton: HTMLButtonElement = document.createElement("button");
    saveButton.textContent = "Save Selection";
    saveButton.style.position = "absolute";
    saveButton.style.bottom = "10px";
    saveButton.style.left = "10px";
    container.appendChild(saveButton);

    saveButton.addEventListener("click", () => {
      const currentImage = getCurrentImage();
      saveCroppedImage(
        currentImage,
        selectorBox,
        boxWidth,
        boxHeight,
        container
      );
    });
  }

  async function saveCroppedImage(
    image: HTMLImageElement,
    selectorBox: HTMLDivElement,
    width: number,
    height: number,
    popupContainer: HTMLElement
  ): Promise<void> {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");

    if (!ctx) {
      console.error("Unable to get canvas context");
      return;
    }

    canvas.width = 250;
    canvas.height = 125;

    const scale: number = image.naturalWidth / image.width;
    const boxX: number = parseInt(selectorBox.style.left) * scale;
    const boxY: number = parseInt(selectorBox.style.top) * scale;

    ctx.drawImage(
      image,
      boxX,
      boxY,
      width * scale,
      height * scale,
      0,
      0,
      250,
      125
    );

    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg")
    );

    const link: HTMLAnchorElement = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg");
    link.download = "ir_patch.jpg";
    link.click();
    popupContainer.remove();
  }
})();
