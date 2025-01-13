(function () {
  // Create a floating DIV to hold multiple buttons
  const buttonContainer: HTMLDivElement = document.createElement("div");
  buttonContainer.style.position = "fixed";
  buttonContainer.style.bottom = "20px";
  buttonContainer.style.right = "20px";
  buttonContainer.style.zIndex = "10000";
  document.body.appendChild(buttonContainer);

  // Create a button to Open Image Editor
  const button: HTMLButtonElement = document.createElement("button");
  button.textContent = "Open Image Editor";
  button.style.marginLeft = "2px";
  button.style.padding = "10px 15px";
  button.style.backgroundColor = "#007BFF";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "5px";
  button.style.cursor = "pointer";

  buttonContainer.appendChild(button);

  // Create a button for "Good" image
  const goodButton: HTMLButtonElement = document.createElement("button");
  goodButton.textContent = "Good";
  goodButton.style.padding = "10px 15px";
  goodButton.style.backgroundColor = "#28a745";
  goodButton.style.color = "white";
  goodButton.style.border = "none";
  goodButton.style.borderRadius = "5px";
  goodButton.style.cursor = "pointer";

  // Insert before the Open Image Editor button
  buttonContainer.insertBefore(goodButton, button);

  // Create a button for "Good" image that is missing good enlargment ("Partial")
  const partialButton: HTMLButtonElement = document.createElement("button");
  partialButton.textContent = "Partial";
  partialButton.style.marginLeft = "2px";
  partialButton.style.padding = "10px 15px";
  partialButton.style.backgroundColor = "#ffc107";
  partialButton.style.color = "black";
  partialButton.style.border = "none";
  partialButton.style.borderRadius = "5px";
  partialButton.style.cursor = "pointer";

  // Insert before the Open Image Editor button
  buttonContainer.insertBefore(partialButton, button);

  let selectorBox = document.createElement("div");
  const boxWidth: number = 280;
  const boxHeight: number = 160;

  let isMouseFollowEnabled = true;

  let toggleButton: HTMLButtonElement;

  // const context1ImageSelector =
  //   "#dform_widget_html_ahtm_ase_camera_incident_images > p > img";

  // // Every time a new iframe loads into the page, we need to look for the context1 image being loaded in
  // // Actions will be taken once it is found in a new iframe
  // // The image may not be immediately available when the iframe loads, so we need to wait for it to load
  // // before we can take actions on it. The page will not refresh before next time it is needed again, but
  // // new iframes with the image will be loaded in again. So we have to monitor for the image to be loaded
  // // in each iframe.
  // const observer = new MutationObserver((mutationsList, observer) => {
  //   for (const mutation of mutationsList) {
  //     if (mutation.type === "childList") {
  //       const context1Image = document.querySelector(context1ImageSelector);
  //       if (context1Image) {
  //         // Enable the button
  //         alert("found image");
  //         observer.disconnect();
  //       }
  //     }
  //   }
  // });

  button.addEventListener("click", () => {
    // Old method of getting image, now direct to the source
    // const img: HTMLImageElement | null = document.querySelector(
    //   "#dform_widget_html_ahtm_ase_camera_incident_images > p > img"
    // );

    // Get reference number from the page to use in direct URL for image src's
    const refNumber = document.querySelector(
      "#dform_ref_display > span"
    )?.textContent;

    const contextOneImageSrc =
      "https://waterlooqa.form.capreview.empro.verintcloudservices.com/api/private/getfile?ref=" +
      refNumber +
      "&filename=context_1.jpg";

    // Load IR Image from the server (Direct URL)
    const irImgSrc =
      "https://waterlooqa.form.capreview.empro.verintcloudservices.com/api/private/getfile?ref=" +
      refNumber +
      "&filename=ir.jpg";

    if (!contextOneImageSrc) {
      alert("No context_1 image found.");
      return;
    }

    if (!irImgSrc) {
      alert("No IR image found.");
      return;
    }

    openImageEditor(contextOneImageSrc, irImgSrc);
  });

  goodButton.addEventListener("click", () => {
    formAutoComplete();
  });

  partialButton.addEventListener("click", () => {
    formAutoComplete(true, true, true, true, false, true, 1);
  });

  function formAutoComplete(
    exceededSpeed: boolean = true,
    vehicleMarkerPresent: boolean = true,
    markerCorrectLane: boolean = true,
    licensePlateClear: boolean = true,
    enlargementCorrectClear: boolean = true,
    locationDataBoxMatch: boolean = true,
    imageCodeNameValue: number = 1
  ) {
    autoCompleteYesOrNo(
      "#dform_widget_ase_rad_ase_camera_incident_exceeded_speed",
      exceededSpeed
    );
    autoCompleteYesOrNo(
      "#dform_widget_ase_rad_ase_camera_vehicle_marker_present",
      vehicleMarkerPresent
    );
    autoCompleteYesOrNo(
      "#dform_widget_ase_rad_ase_camera_marker_correct_lane",
      markerCorrectLane
    );
    autoCompleteYesOrNo(
      "#dform_widget_ase_rad_ase_camera_license_plate_clear",
      licensePlateClear
    );
    autoCompleteYesOrNo(
      "#dform_widget_ase_rad_ase_camera_license_plate_correct_clear",
      enlargementCorrectClear,
      !enlargementCorrectClear
    );
    autoCompleteYesOrNo(
      "#dform_widget_ase_rad_ase_camera_location_data_box_match_site_info",
      locationDataBoxMatch
    );

    // Set Image Code Name selector to the value 1 option
    const imageCodeNameSelector = document.querySelector(
      "#dform_widget_ase_sel_ase_camera_image_code_name"
    ) as HTMLSelectElement;

    if (imageCodeNameSelector) {
      imageCodeNameSelector.selectedIndex = imageCodeNameValue;
    }
  }

  function autoCompleteYesOrNo(
    baseSelector: string,
    value: boolean = true,
    triggerEnlargementReupload: boolean = false
  ): void {
    const selector = value ? baseSelector + "1" : baseSelector + "2";
    const buttonToCheckOff = document.querySelector(
      selector
    ) as HTMLInputElement;

    // Trigger a click on the input element to check it off
    if (buttonToCheckOff) {
      buttonToCheckOff.click();

      // Wait 150 ms before triggering the re-upload button if needed
      if (triggerEnlargementReupload) {
        setTimeout(() => {
          const reuploadButton = document.querySelector(
            "#dform_widget_file_po_camera_upload_photo"
          ) as HTMLButtonElement;

          if (reuploadButton) {
            reuploadButton.click();
          }
        }, 100);
      }
    }
  }

  function enableMouseFollow(
    container: HTMLElement,
    getCurrentImage: () => HTMLImageElement
  ) {
    isMouseFollowEnabled = true;

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseFollowEnabled) return;

      const x: number = Math.max(
        0,
        e.clientX - boxWidth / 2 + container.scrollLeft
      );
      const y: number = Math.max(
        0,
        e.clientY - boxHeight / 2 + container.scrollTop
      );

      selectorBox.style.left = `${x}px`;
      selectorBox.style.top = `${y}px`;
    };

    const stopMouseFollow = (e: MouseEvent) => {
      const currentImage = getCurrentImage(); // Retrieve the current image dynamically

      // Ignore clicks on the toggle button or the current image
      if (e.target === toggleButton || e.target === currentImage) return;

      container.removeEventListener("mousemove", onMouseMove);
      isMouseFollowEnabled = false;

      // Remove this click listener
      container.removeEventListener("click", stopMouseFollow);
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("click", stopMouseFollow);
  }

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
    toggleButton = document.createElement("button");
    toggleButton.textContent = "Switch Image";
    toggleButton.style.position = "fixed";
    toggleButton.style.top = "10px";
    toggleButton.style.left = "10px";
    toggleButton.style.zIndex = "10002";

    toggleButton.style.padding = "10px 15px";
    toggleButton.style.backgroundColor = "#007BFF";
    toggleButton.style.color = "white";
    toggleButton.style.border = "none";
    toggleButton.style.borderRadius = "5px";
    toggleButton.style.cursor = "pointer";

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

    // Center the horizontal scrollbar
    setTimeout(() => {
      popup.scrollLeft = (popup.scrollWidth - popup.clientWidth) / 2 + 150;
      popup.scrollTop = (popup.scrollHeight - popup.clientHeight) / 2 + 175;
    }, 250);

    let currentImage = image;

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseFollowEnabled) return;
      const x: number = Math.max(
        0,
        e.clientX - boxWidth / 2 + popup.scrollLeft
      );
      const y: number = Math.max(
        0,
        e.clientY - boxHeight / 2 + popup.scrollTop
      );

      selectorBox.style.left = `${x}px`;
      selectorBox.style.top = `${y}px`;
    };

    toggleButton.addEventListener("click", (e: MouseEvent) => {
      // Prevent the click from propagating to the popup container
      e.stopPropagation();

      if (currentImage === image) {
        image.style.display = "none";
        irImage.style.display = "block";
        currentImage = irImage;
      } else {
        irImage.style.display = "none";
        image.style.display = "block";
        currentImage = image;
      }

      // Re-enable mouse-follow after toggling images
      if (!isMouseFollowEnabled) {
        enableMouseFollow(popup, () => currentImage);
      }
    });

    addSelectionBox(popup, () => currentImage);
  }

  function addSelectionBox(
    container: HTMLElement,
    getCurrentImage: () => HTMLImageElement
  ): void {
    selectorBox = document.createElement("div");

    selectorBox.style.position = "absolute";
    selectorBox.style.border = "2px dashed red";
    selectorBox.style.width = `${boxWidth}px`;
    selectorBox.style.height = `${boxHeight}px`;
    selectorBox.style.cursor = "move";
    container.appendChild(selectorBox);

    const onMouseMove = (e: MouseEvent) => {
      const x: number = Math.max(
        0,
        e.clientX - boxWidth / 2 + container.scrollLeft
      );
      const y: number = Math.max(
        0,
        e.clientY - boxHeight / 2 + container.scrollTop
      );

      selectorBox.style.left = `${x}px`;
      selectorBox.style.top = `${y}px`;
    };

    function attachMouseMoveListener() {
      container.addEventListener("mousemove", onMouseMove);
    }

    attachMouseMoveListener();

    container.addEventListener(
      "click",
      (e) => {
        // Prevent stopping mouse-follow if the click is on the toggle button
        if (e.target === toggleButton) return;

        container.removeEventListener("mousemove", onMouseMove);
        isMouseFollowEnabled = false;
      },
      { once: true }
    );

    let startX: number = 0,
      startY: number = 0;

    selectorBox.addEventListener("mousedown", (e: MouseEvent) => {
      startX = e.clientX - selectorBox.offsetLeft;
      startY = e.clientY - selectorBox.offsetTop;

      const onMouseMove = (e: MouseEvent) => {
        const x: number = Math.max(
          0,
          e.clientX - startX + container.scrollLeft
        );
        const y: number = Math.max(0, e.clientY - startY + container.scrollTop);

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
    saveButton.style.position = "fixed";
    saveButton.style.top = "60px";
    saveButton.style.left = "10px";
    saveButton.style.zIndex = "10003";

    saveButton.style.padding = "10px 15px";
    saveButton.style.backgroundColor = "rgb(64 149 0)";
    saveButton.style.color = "white";
    saveButton.style.border = "none";
    saveButton.style.borderRadius = "5px";
    saveButton.style.cursor = "pointer";

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

    canvas.width = 280;
    canvas.height = 160;

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
      280,
      160
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
