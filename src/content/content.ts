(function () {
  // Create a floating DIV to hold multiple buttons
  const buttonContainer: HTMLDivElement = document.createElement("div");
  buttonContainer.style.position = "fixed";
  buttonContainer.style.bottom = "40x";
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
  const boxHeight: number = 80;

  let isMouseFollowEnabled = true;

  let toggleButton: HTMLButtonElement;

  button.addEventListener("click", () => {
    // Old method of getting image, now direct to the source
    // const img: HTMLImageElement | null = document.querySelector(
    //   "#dform_widget_html_ahtm_ase_camera_incident_images > p > img"
    // );

    const isProd = window.location.href.includes(
      "form.ca.empro.verintcloudservices.com"
    );

    const baseUrl = isProd
      ? "https://waterloo.form.ca.empro.verintcloudservices.com"
      : "https://waterlooqa.form.capreview.empro.verintcloudservices.com";

    // Get reference number from the page to use in direct URL for image src's
    const refNumber = document.querySelector(
      "#dform_ref_display > span"
    )?.textContent;

    const contextOneImageSrc =
      baseUrl +
      "/api/private/getfile?ref=" +
      refNumber +
      "&filename=context_1.jpg";

    // Load IR Image from the server (Direct URL)
    const irImgSrc =
      baseUrl + "/api/private/getfile?ref=" + refNumber + "&filename=ir.jpg";

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

    const closeButton: HTMLButtonElement = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.position = "fixed";
    closeButton.style.top = "10px";
    closeButton.style.right = "6%";
    closeButton.style.zIndex = "10002";

    closeButton.style.padding = "10px 15px";
    closeButton.style.backgroundColor = "red";
    closeButton.style.color = "white";
    closeButton.style.border = "none";
    closeButton.style.borderRadius = "5px";
    closeButton.style.cursor = "pointer";

    popup.appendChild(closeButton);

    closeButton.addEventListener("click", () => {
      popup.remove();
    });

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
      saveCroppedImage(currentImage, selectorBox, container);
    });
  }

  async function saveCroppedImage(
    image: HTMLImageElement,
    selectorBox: HTMLDivElement,
    popupContainer: HTMLElement
  ): Promise<void> {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");

    if (!ctx) {
      console.error("Unable to get canvas context");
      return;
    }

    canvas.width = boxWidth;
    canvas.height = boxHeight;

    const scale: number = image.naturalWidth / image.width;
    const boxX: number = parseInt(selectorBox.style.left) * scale;
    const boxY: number = parseInt(selectorBox.style.top) * scale;

    ctx.drawImage(
      image,
      boxX,
      boxY,
      boxWidth * scale,
      boxHeight * scale,
      0,
      0,
      boxWidth,
      boxHeight
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
  console.log(
    "[Debug - MutationObserver] Content script running on:",
    window.location.href
  );

  // Avoid injecting multiple times in this frame
  if (document.getElementById("clonedPlateInput")) {
    console.log(
      "[Debug - MutationObserver] Cloned input already exists in this frame. Doing nothing."
    );
  } else {
    // A function to check if both elements exist. If so, inject the cloned input.
    const tryInjectClonedInput = () => {
      const plateInput = document.querySelector<HTMLInputElement>(
        "#dform_widget_txt_platenumber"
      );
      const imagesDiv = document.querySelector<HTMLDivElement>(
        "#dform_widget_html_ahtm_ase_camera_incident_images"
      );

      console.log(
        "[Debug - MutationObserver] Checking for plate input & imagesDiv:",
        { plateInput, imagesDiv }
      );

      if (plateInput && imagesDiv) {
        console.log(
          "[Debug - MutationObserver] Found plate input and imagesDiv. Inserting cloned input..."
        );

        // Prevent repeated injections if already added (e.g., by a previous mutation event)
        if (document.getElementById("clonedPlateInput")) {
          console.log(
            "[Debug - MutationObserver] The cloned input is already present (likely from another trigger). Skipping creation."
          );
          return;
        }

        // 1. Create the cloned input
        const clonedInput = plateInput.cloneNode(false) as HTMLInputElement;

        // 2. Update the ID and name to avoid conflicts
        clonedInput.id = "clonedPlateInput";
        clonedInput.name = "clonedPlateInput";

        // 3. Insert the new input into the DOM (under imagesDiv).
        imagesDiv.appendChild(clonedInput);

        // 4. Sync from cloned -> real
        clonedInput.addEventListener("input", () => {
          // Save the selection range
          const selStart = clonedInput.selectionStart || 0;
          const selEnd = clonedInput.selectionEnd || 0;

          // Convert typed text to uppercase
          const newValue = clonedInput.value.toUpperCase();
          // Only update if it changed
          if (newValue !== clonedInput.value) {
            clonedInput.value = newValue;
            // Restore the cursor positions
            clonedInput.selectionStart = selStart;
            clonedInput.selectionEnd = selEnd;
          }

          // Now push to the real field
          plateInput.value = clonedInput.value; // Already uppercase
          plateInput.dispatchEvent(new Event("input", { bubbles: true }));
        });

        // 5. Sync from real -> cloned
        plateInput.addEventListener("input", () => {
          clonedInput.value = plateInput.value;
        });

        // 6. Initialize
        setTimeout(() => {
          clonedInput.value = plateInput.value;
          console.log(
            "[Debug] Cloned input's initial value set to:",
            clonedInput.value
          );
        }, 1000);

        console.log(
          "[Debug - MutationObserver] Cloned plate input inserted and syncing is set up."
        );

        // 7. Observe the grandparent div of the original input for 'dform_hidden' class changes and sync visibility
        const plateInputGrandparentDiv =
          plateInput.parentElement?.parentElement;

        if (!plateInputGrandparentDiv) {
          console.error(
            "[Debug - VisibilitySync] Could not find grandparent div of plateInput."
          );
          return; // Exit if the structure isn't as expected
        }

        const handleVisibilitySync = () => {
          if (plateInputGrandparentDiv.classList.contains("dform_hidden")) {
            console.log(
              "[Debug - VisibilitySync] Original input's grandparent is hidden. Hiding cloned input."
            );
            clonedInput.style.display = "none";
          } else {
            console.log(
              "[Debug - VisibilitySync] Original input's grandparent is visible. Showing cloned input."
            );
            clonedInput.style.display = ""; // Reset display style
          }
        };

        // Initial check in case the class is already present when the script runs
        handleVisibilitySync();

        // Set up observer for class attribute changes on the grandparent div
        const visibilityObserver = new MutationObserver((mutationsList) => {
          for (const mutation of mutationsList) {
            if (
              mutation.type === "attributes" &&
              mutation.attributeName === "class"
            ) {
              console.log(
                "[Debug - VisibilitySync] Class attribute changed on original input's grandparent div."
              );
              handleVisibilitySync();
            }
          }
        });

        visibilityObserver.observe(plateInputGrandparentDiv, {
          attributes: true,
        });
        console.log(
          "[Debug - VisibilitySync] Observer set up for original input's grandparent div class attribute."
        );
      }
    };

    // Try once in case the elements are already there
    tryInjectClonedInput();

    // Set up a MutationObserver on the entire body to watch for new elements
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const addedNode of mutation.addedNodes) {
          if (addedNode.nodeType === Node.ELEMENT_NODE) {
            // console.log(
            //   "[Debug - MutationObserver] New element added inside iframe:",
            //   addedNode
            // );
          }
        }
      }
      // Each time something new is added, check if we can inject now
      tryInjectClonedInput();
    });

    // Observe the body (or document.documentElement) for child additions anywhere
    observer.observe(document.body, { childList: true, subtree: true });

    console.log(
      "[Debug - MutationObserver] Set up MutationObserver in this frame."
    );
  }
})();
