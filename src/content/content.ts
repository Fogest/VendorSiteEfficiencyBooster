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

    if (!img) {
      alert("No image found.");
      return;
    }

    openImageEditor(img.src);
  });

  function openImageEditor(imageUrl: string): void {
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
    popup.style.overflow = "hidden";
    document.body.appendChild(popup);

    // Add image for editing
    const image: HTMLImageElement = new Image();
    image.src = imageUrl;
    image.style.position = "relative";
    image.style.maxWidth = "100%";
    image.style.maxHeight = "100%";
    popup.appendChild(image);

    addSelectionBox(popup, image);
  }

  function addSelectionBox(
    container: HTMLElement,
    image: HTMLImageElement
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
      saveCroppedImage(image, selectorBox, boxWidth, boxHeight, container);
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
