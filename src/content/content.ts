(function () {
  // Check if we're on a bulk action page with isBulkMode=true
  const urlParams = new URLSearchParams(window.location.search);
  const isBulkMode = urlParams.get("isBulkMode") === "true";

  // Track the last checkbox clicked for shift-click functionality
  let lastCheckedIndex: number | null = null;

  // If in bulk mode, set up the bulk selection feature
  if (isBulkMode) {
    console.log("[Bulk Mode] Enabling bulk action features");

    // Create the floating box for bulk selection
    const bulkSelectionBox = document.createElement("div");
    bulkSelectionBox.style.position = "fixed";
    bulkSelectionBox.style.bottom = "100px";
    bulkSelectionBox.style.right = "20px";
    bulkSelectionBox.style.backgroundColor = "white";
    bulkSelectionBox.style.border = "1px solid #ccc";
    bulkSelectionBox.style.borderRadius = "5px";
    bulkSelectionBox.style.padding = "10px";
    bulkSelectionBox.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    bulkSelectionBox.style.zIndex = "10000";
    bulkSelectionBox.style.display = "flex";
    bulkSelectionBox.style.alignItems = "center";

    // Create the number input
    const numberInput = document.createElement("input");
    numberInput.type = "number";
    numberInput.min = "1";
    numberInput.max = "100";
    numberInput.value = "10";
    numberInput.style.width = "60px";
    numberInput.style.marginRight = "10px";
    numberInput.style.padding = "5px";
    numberInput.style.border = "1px solid #ccc";
    numberInput.style.borderRadius = "3px";

    // Create the grab button
    const grabButton = document.createElement("button");
    grabButton.textContent = "Grab";
    grabButton.style.padding = "5px 10px";
    grabButton.style.backgroundColor = "#007BFF";
    grabButton.style.color = "white";
    grabButton.style.border = "none";
    grabButton.style.borderRadius = "3px";
    grabButton.style.cursor = "pointer";

    // Create a status message element
    const statusMessage = document.createElement("div");
    statusMessage.style.marginTop = "5px";
    statusMessage.style.fontSize = "12px";
    statusMessage.style.color = "#666";
    statusMessage.style.display = "none";

    // Add elements to the box
    bulkSelectionBox.appendChild(numberInput);
    bulkSelectionBox.appendChild(grabButton);
    bulkSelectionBox.appendChild(statusMessage);

    // Add the box to the page
    document.body.appendChild(bulkSelectionBox);

    // Add click handler for the grab button
    grabButton.addEventListener("click", () => {
      // Get the number of items to select
      const numToSelect = parseInt(numberInput.value);

      if (isNaN(numToSelect) || numToSelect < 1 || numToSelect > 100) {
        statusMessage.textContent = "Please enter a number between 1 and 100";
        statusMessage.style.color = "red";
        statusMessage.style.display = "block";
        return;
      }

      // Find all checkboxes
      const checkboxes = Array.from(
        document.querySelectorAll(".select-item-checkbox")
      ).filter((checkbox) =>
        checkbox.id.startsWith("item")
      ) as HTMLInputElement[];

      // Count how many were actually selected
      let actuallySelected = 0;

      // First, ensure the requested number are checked
      for (let i = 0; i < Math.min(numToSelect, checkboxes.length); i++) {
        if (!checkboxes[i].checked) {
          checkboxes[i].click();
        }
        actuallySelected++;
      }

      // Then ensure all others are unchecked
      for (let i = numToSelect; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
          checkboxes[i].click();
        }
      }

      // Show status message if not all requested items could be selected
      if (actuallySelected < numToSelect) {
        statusMessage.textContent = `Selected ${actuallySelected} out of ${numToSelect} requested (only ${actuallySelected} items available)`;
        statusMessage.style.color = "orange";
        statusMessage.style.display = "block";
      } else {
        statusMessage.textContent = `Selected ${actuallySelected} items`;
        statusMessage.style.color = "green";
        statusMessage.style.display = "block";
      }

      // Hide the message after 3 seconds
      setTimeout(() => {
        statusMessage.style.display = "none";
      }, 3000);
    });
  }

  // Only show buttons on specific penalty order pages
  const currentUrl = window.location.href;
  const showButtons =
    currentUrl.startsWith(
      "https://waterloo.form.ca.empro.verintcloudservices.com/form/view/app_penalty_order/"
    ) ||
    currentUrl.startsWith(
      "https://waterlooqa.form.capreview.empro.verintcloudservices.com/form/view/app_penalty_order/"
    );

  if (showButtons) {
    // Create a floating DIV to hold multiple buttons
    const buttonContainer: HTMLDivElement = document.createElement("div");
    buttonContainer.style.position = "fixed";
    buttonContainer.style.bottom = "40px";
    // buttonContainer.style.right = "20px";
    buttonContainer.style.left = "30%";
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

    // Create a button for "Good" image
    const goodButton: HTMLButtonElement = document.createElement("button");
    goodButton.textContent = "Good";
    goodButton.style.marginLeft = "2px";
    goodButton.style.padding = "10px 15px";
    goodButton.style.backgroundColor = "#28a745";
    goodButton.style.color = "white";
    goodButton.style.border = "none";
    goodButton.style.borderRadius = "5px";
    goodButton.style.cursor = "pointer";

    // Insert before the Open Image Editor button
    buttonContainer.insertBefore(goodButton, partialButton);

    // Create "Bad" button with dropdown menu
    const badWrapper = document.createElement("div");
    badWrapper.className = "bad-action-wrapper";
    badWrapper.style.position = "relative";
    badWrapper.style.display = "inline-block";
    badWrapper.style.marginLeft = "2px";

    const badButton = document.createElement("button");
    badButton.className = "quick-action bad-action";
    badButton.textContent = "Bad";
    badButton.style.padding = "10px 15px";
    badButton.style.backgroundColor = "#dc3545";
    badButton.style.color = "white";
    badButton.style.border = "none";
    badButton.style.borderRadius = "5px";
    badButton.style.cursor = "pointer";

    const badMenu = document.createElement("div");
    badMenu.className = "bad-options-menu";
    badMenu.style.display = "none";
    badMenu.style.position = "absolute";
    badMenu.style.bottom = "100%";
    badMenu.style.right = "0";
    badMenu.style.width = "250px";
    badMenu.style.backgroundColor = "white";
    badMenu.style.border = "1px solid #ddd";
    badMenu.style.borderRadius = "5px";
    badMenu.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    badMenu.style.zIndex = "10001";
    badMenu.style.overflow = "hidden";

    // Add menu options
    const addOption = (text: string, params: any) => {
      const option = document.createElement("div");
      option.className = "bad-option";
      option.textContent = text;
      option.style.padding = "8px 12px";
      option.style.cursor = "pointer";
      option.style.borderBottom = "1px solid #eee";
      option.dataset.code = params.imageCodeNameValue;
      option.dataset.lpclear =
        params.licensePlateClear === false ? "false" : "true";
      if (params.enlargementCorrectClear !== undefined) {
        option.dataset.enlargementclear =
          params.enlargementCorrectClear === false ? "false" : "true";
      }
      if (params.vehicleMarkerPresent !== undefined) {
        option.dataset.vehiclemarker =
          params.vehicleMarkerPresent === false ? "false" : "true";
      }

      option.addEventListener("mouseenter", () => {
        option.style.backgroundColor = "#f5f5f5";
      });
      option.addEventListener("mouseleave", () => {
        option.style.backgroundColor = "";
      });
      option.addEventListener("click", () => {
        formAutoComplete(
          true,
          params.vehicleMarkerPresent !== false,
          true,
          params.licensePlateClear !== false,
          params.enlargementCorrectClear !== false,
          true,
          params.imageCodeNameValue
        );
        badMenu.style.display = "none";
      });
      return option;
    };

    // Class 2 options
    const class2Header = document.createElement("div");
    class2Header.className = "bad-category-header";
    class2Header.textContent = "Class 2";
    class2Header.style.padding = "6px 12px";
    class2Header.style.backgroundColor = "#f8f9fa";
    class2Header.style.fontWeight = "bold";
    badMenu.appendChild(class2Header);

    badMenu.appendChild(
      addOption("Image Unclear", {
        imageCodeNameValue: 18,
        licensePlateClear: false,
        enlargementCorrectClear: false,
      })
    );
    badMenu.appendChild(
      addOption("Insufficient Flash", {
        imageCodeNameValue: 19,
        licensePlateClear: false,
        enlargementCorrectClear: false,
      })
    );
    badMenu.appendChild(
      addOption("Vehicle Marker", {
        imageCodeNameValue: 61,
        vehicleMarkerPresent: false,
      })
    );

    // Class 3 options
    const class3Header = document.createElement("div");
    class3Header.className = "bad-category-header";
    class3Header.textContent = "Class 3";
    class3Header.style.padding = "6px 12px";
    class3Header.style.backgroundColor = "#f8f9fa";
    class3Header.style.fontWeight = "bold";
    badMenu.appendChild(class3Header);

    badMenu.appendChild(
      addOption("Blocked Window", {
        imageCodeNameValue: 20,
        licensePlateClear: false,
        enlargementCorrectClear: false,
      })
    );
    badMenu.appendChild(
      addOption("Damaged Plate", {
        imageCodeNameValue: 4,
        licensePlateClear: false,
        enlargementCorrectClear: false,
      })
    );
    badMenu.appendChild(
      addOption("Dirty Plate", {
        imageCodeNameValue: 22,
        licensePlateClear: false,
      })
    );
    badMenu.appendChild(
      addOption("Excessive Sun Glare", {
        imageCodeNameValue: 13,
        licensePlateClear: false,
        enlargementCorrectClear: false,
      })
    );
    badMenu.appendChild(
      addOption("Licence plate obstructed", {
        imageCodeNameValue: 5,
        licensePlateClear: false,
        enlargementCorrectClear: false,
      })
    );
    badMenu.appendChild(
      addOption("Trailer Plate", {
        imageCodeNameValue: 11,
      })
    );

    // Generic options
    const genericHeader = document.createElement("div");
    genericHeader.className = "bad-category-header";
    genericHeader.textContent = "Generic";
    genericHeader.style.padding = "6px 12px";
    genericHeader.style.backgroundColor = "#f8f9fa";
    genericHeader.style.fontWeight = "bold";
    badMenu.appendChild(genericHeader);

    badMenu.appendChild(
      addOption("Generic Plate Unclear", {
        imageCodeNameValue: 22,
        licensePlateClear: false,
      })
    );

    // Hover handlers
    let hideTimeout: number;
    badButton.addEventListener("mouseover", () => {
      clearTimeout(hideTimeout);
      badMenu.style.display = "block";
    });
    badWrapper.addEventListener("mouseleave", () => {
      hideTimeout = window.setTimeout(() => {
        badMenu.style.display = "none";
      }, 200);
    });
    badMenu.addEventListener("mouseover", () => {
      clearTimeout(hideTimeout);
    });

    badWrapper.appendChild(badButton);
    badWrapper.appendChild(badMenu);
    buttonContainer.insertBefore(badWrapper, button);

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
      formAutoComplete(true, true, true, true, false, true, 1, true);
    });

    function formAutoComplete(
      exceededSpeed: boolean = true,
      vehicleMarkerPresent: boolean = true,
      markerCorrectLane: boolean = true,
      licensePlateClear: boolean = true,
      enlargementCorrectClear: boolean = true,
      locationDataBoxMatch: boolean = true,
      imageCodeNameValue: number = 1,
      triggerEnlargementReupload: boolean = false,
      scrollToElementOnComplete: string = "#dform_widget_button_but_ase_submission"
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
        triggerEnlargementReupload
      );
      autoCompleteYesOrNo(
        "#dform_widget_ase_rad_ase_camera_location_data_box_match_site_info",
        locationDataBoxMatch
      );

      // Set Image Code Name selector to the specified value
      const imageCodeNameSelector = document.querySelector(
        "#dform_widget_ase_sel_ase_camera_image_code_name"
      ) as HTMLSelectElement;

      if (imageCodeNameSelector) {
        // Find option with matching value attribute
        const options = Array.from(imageCodeNameSelector.options);
        const targetOption = options.find(
          (opt) => parseInt(opt.value) === imageCodeNameValue
        );

        if (targetOption) {
          targetOption.selected = true;
        } else {
          console.warn(
            `Could not find option with value ${imageCodeNameValue}`
          );
        }
      }

      // Scroll to element if specified
      if (scrollToElementOnComplete) {
        const element = document.querySelector(scrollToElementOnComplete);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
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
          const y: number = Math.max(
            0,
            e.clientY - startY + container.scrollTop
          );

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
  }

  // Avoid injecting multiple times in this frame
  if (document.getElementById("clonedPlateInput")) {
  } else {
    // A function to check if both elements exist. If so, inject the cloned input.
    const tryInjectClonedInput = () => {
      const plateInput = document.querySelector<HTMLInputElement>(
        "#dform_widget_txt_platenumber"
      );
      const imagesDiv = document.querySelector<HTMLDivElement>(
        "#dform_widget_html_ahtm_ase_camera_incident_images"
      );

      if (plateInput && imagesDiv) {
        // Prevent repeated injections if already added (e.g., by a previous mutation event)
        if (document.getElementById("clonedPlateInput")) {
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
  }
})();
