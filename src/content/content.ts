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
    bulkSelectionBox.style.bottom = "100px"; // Keep this distinct from the summary box
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

  // --- Storage Keys ---
  const SUMMARY_BOX_STATE_KEY = "summaryBoxMinimized";
  const SUMMARY_BOX_POS_TOP_KEY = "summaryBoxTop";
  const SUMMARY_BOX_POS_LEFT_KEY = "summaryBoxLeft";

  // --- Storage Functions for Summary Box State & Position ---
  async function getSummaryBoxState(): Promise<boolean> {
    try {
      const result = await chrome.storage.local.get(SUMMARY_BOX_STATE_KEY);
      return result[SUMMARY_BOX_STATE_KEY] || false; // Default to not minimized
    } catch (error) {
      console.error("Error getting summary box state:", error);
      return false; // Fallback state
    }
  }

  function saveSummaryBoxState(isMinimized: boolean): void {
    try {
      chrome.storage.local.set({ [SUMMARY_BOX_STATE_KEY]: isMinimized });
    } catch (error) {
      console.error("Error saving summary box state:", error);
    }
  }

  async function getSummaryBoxPosition(): Promise<{
    top: number | null;
    left: number | null;
  }> {
    try {
      const result = await chrome.storage.local.get([
        SUMMARY_BOX_POS_TOP_KEY,
        SUMMARY_BOX_POS_LEFT_KEY,
      ]);
      return {
        top: result[SUMMARY_BOX_POS_TOP_KEY] ?? null,
        left: result[SUMMARY_BOX_POS_LEFT_KEY] ?? null,
      };
    } catch (error) {
      console.error("Error getting summary box position:", error);
      return { top: null, left: null }; // Fallback state
    }
  }

  function saveSummaryBoxPosition(top: number, left: number): void {
    try {
      chrome.storage.local.set({
        [SUMMARY_BOX_POS_TOP_KEY]: top,
        [SUMMARY_BOX_POS_LEFT_KEY]: left,
      });
      console.log(`[Debug] Saved position: top=${top}, left=${left}`);
    } catch (error) {
      console.error("Error saving summary box position:", error);
    }
  }
  // --- End Storage Functions ---

  let summaryBoxLeftOffset: number | null = null; // Variable to store calculated initial left position

  if (showButtons) {
    // Create a floating DIV to hold multiple buttons
    const buttonContainer: HTMLDivElement = document.createElement("div");
    buttonContainer.style.position = "fixed";
    buttonContainer.style.bottom = "40px";
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

    // --- Calculate Initial Summary Box Position AFTER button exists ---
    setTimeout(() => {
      if (button) {
        const buttonRect = button.getBoundingClientRect();
        summaryBoxLeftOffset = buttonRect.left + window.scrollX;
        console.log(
          "[Debug] Calculated initial summary box left offset:",
          summaryBoxLeftOffset
        );
      }
    }, 100); // Wait briefly for rendering

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
      addOption("Excessive Snow", {
        imageCodeNameValue: 31,
        licensePlateClear: false,
        enlargementCorrectClear: false,
      })
    );
    badMenu.appendChild(
      addOption("Image Adjudication (Privacy)", {
        imageCodeNameValue: 57,
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
      addOption("No Licence Plates", {
        imageCodeNameValue: 3,
      })
    );
    badMenu.appendChild(
      addOption("Out of Country", {
        imageCodeNameValue: 58,
      })
    );
    badMenu.appendChild(
      addOption("Out of Province", {
        imageCodeNameValue: 10,
      })
    );
    badMenu.appendChild(
      addOption("Trailer Plate", {
        imageCodeNameValue: 11,
      })
    );

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
    let imageEditorToggleButton: HTMLButtonElement; // Renamed to avoid conflict

    button.addEventListener("click", () => {
      const isProd = window.location.href.includes(
        "form.ca.empro.verintcloudservices.com"
      );
      const baseUrl = isProd
        ? "https://waterloo.form.ca.empro.verintcloudservices.com"
        : "https://waterlooqa.form.capreview.empro.verintcloudservices.com";
      const refNumber = document.querySelector(
        "#dform_ref_display > span"
      )?.textContent;
      const contextOneImageSrc =
        baseUrl +
        "/api/private/getfile?ref=" +
        refNumber +
        "&filename=context_1.jpg";
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
      const imageCodeNameSelector = document.querySelector(
        "#dform_widget_ase_sel_ase_camera_image_code_name"
      ) as HTMLSelectElement;
      if (imageCodeNameSelector) {
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
      if (buttonToCheckOff) {
        buttonToCheckOff.click();
        if (triggerEnlargementReupload) {
          // Set the scroll flag here so it works for both flows
          chrome.storage.local.set({ pendingScroll: true });
          setTimeout(() => {
            const reuploadButton = document.querySelector(
              "#dform_widget_file_po_camera_upload_photo"
            ) as HTMLButtonElement;
            if (reuploadButton) {
              reuploadButton.click();
            }
          }, 500);
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
        const currentImage = getCurrentImage();
        if (e.target === imageEditorToggleButton || e.target === currentImage)
          return;
        container.removeEventListener("mousemove", onMouseMove);
        isMouseFollowEnabled = false;
        container.removeEventListener("click", stopMouseFollow);
      };
      container.addEventListener("mousemove", onMouseMove);
      container.addEventListener("click", stopMouseFollow);
    }

    function openImageEditor(imageUrl: string, irImageUrl: string): void {
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
      imageEditorToggleButton = document.createElement("button");
      imageEditorToggleButton.textContent = "Switch Image";
      imageEditorToggleButton.style.position = "fixed";
      imageEditorToggleButton.style.top = "10px";
      imageEditorToggleButton.style.left = "10px";
      imageEditorToggleButton.style.zIndex = "10002";
      imageEditorToggleButton.style.padding = "10px 15px";
      imageEditorToggleButton.style.backgroundColor = "#007BFF";
      imageEditorToggleButton.style.color = "white";
      imageEditorToggleButton.style.border = "none";
      imageEditorToggleButton.style.borderRadius = "5px";
      imageEditorToggleButton.style.cursor = "pointer";
      popup.appendChild(imageEditorToggleButton);
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
      const image: HTMLImageElement = new Image();
      image.src = imageUrl;
      image.style.position = "relative";
      image.style.display = "block";
      image.style.margin = "0 auto";
      popup.appendChild(image);
      const irImage: HTMLImageElement = new Image();
      irImage.src = irImageUrl;
      irImage.style.position = "relative";
      irImage.style.display = "none";
      irImage.style.margin = "0 auto";
      popup.appendChild(irImage);
      setTimeout(() => {
        popup.scrollLeft = (popup.scrollWidth - popup.clientWidth) / 2 + 150;
        popup.scrollTop = (popup.scrollHeight - popup.clientHeight) / 2 + 175;
      }, 250);
      let currentImage = image;
      imageEditorToggleButton.addEventListener("click", (e: MouseEvent) => {
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
          if (e.target === imageEditorToggleButton) return;
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
        const onDragMouseMove = (e: MouseEvent) => {
          const x: number = Math.max(
            0,
            e.clientX - startX // No scrollLeft needed here as position is absolute to container
          );
          const y: number = Math.max(
            0,
            e.clientY - startY // No scrollTop needed here
          );
          selectorBox.style.left = `${x}px`;
          selectorBox.style.top = `${y}px`;
        };
        const onDragMouseUp = () => {
          document.removeEventListener("mousemove", onDragMouseMove);
          document.removeEventListener("mouseup", onDragMouseUp);
        };
        document.addEventListener("mousemove", onDragMouseMove);
        document.addEventListener("mouseup", onDragMouseUp);
      });
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

      // Fallback automation: Check for delete button and handle accordingly
      const deleteButton = document.querySelector(
        "#dform_widget_button_but_del_irpatch"
      ) as HTMLButtonElement;
      if (deleteButton && !deleteButton.classList.contains("dform_hidden")) {
        chrome.storage.local.set({ pendingPartial: true });
        deleteButton.click();
      } else {
        formAutoComplete(true, true, true, true, false, true, 1, true);
      }

      popupContainer.remove();
    }

    // Check for pending partial after reload
    function setupPendingPartial() {
      // Create a new button to finalize the process
      const finalizeButton = document.createElement("button");
      finalizeButton.textContent = "Finalize Replacement";
      finalizeButton.style.position = "fixed";
      finalizeButton.style.bottom = "80px"; // Position it clearly
      finalizeButton.style.left = "50%";
      finalizeButton.style.transform = "translateX(-50%)";
      finalizeButton.style.zIndex = "10001";
      finalizeButton.style.padding = "15px 20px";
      finalizeButton.style.backgroundColor = "#28a745"; // Green for go
      finalizeButton.style.color = "white";
      finalizeButton.style.border = "2px solid white";
      finalizeButton.style.borderRadius = "5px";
      finalizeButton.style.cursor = "pointer";
      finalizeButton.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";

      document.body.appendChild(finalizeButton);

      finalizeButton.addEventListener(
        "click",
        () => {
          // This click has user activation
          formAutoComplete(true, true, true, true, false, true, 1, true);

          // Set the scroll flag here to cover the delete/reload workflow
          chrome.storage.local.set({ pendingScroll: true });

          // Clean up
          document.body.removeChild(finalizeButton);
          chrome.storage.local.remove("pendingPartial");
        },
        { once: true }
      ); // The button should only be clickable once
    }

    chrome.storage.local.get("pendingScroll", (data) => {
      if (data.pendingScroll) {
        const interval = setInterval(() => {
          const elementToScrollTo = document.querySelector(
            "#dform_widget_button_but_ase_submission"
          );
          if (elementToScrollTo) {
            elementToScrollTo.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
            clearInterval(interval);
            chrome.storage.local.remove("pendingScroll");
          }
        }, 500);
      }
    });

    chrome.storage.local.get("pendingPartial", (data) => {
      if (data.pendingPartial) {
        // Wait for the DOM to be ready before adding the button
        const interval = setInterval(() => {
          const formElement = document.querySelector(
            "#dform_widget_ase_rad_ase_camera_incident_exceeded_speed1"
          );
          if (formElement) {
            setupPendingPartial();
            clearInterval(interval);
          }
        }, 500);
      }
    });
  }

  // Avoid injecting multiple times in this frame
  // Check for both cloned input and summary box to prevent duplicates
  if (
    document.getElementById("clonedPlateInput") ||
    document.getElementById("ticket-summary-box")
  ) {
    // Already injected, do nothing
  } else {
    // A function to check if all required elements exist. If so, inject components.
    const tryInjectComponents = () => {
      const plateInput = document.querySelector<HTMLInputElement>(
        "#dform_widget_txt_platenumber"
      );
      const imagesDiv = document.querySelector<HTMLDivElement>(
        "#dform_widget_html_ahtm_ase_camera_incident_images"
      );
      const refDisplaySpan = document.querySelector<HTMLSpanElement>(
        "#dform_ref_display > span"
      );

      // Ensure all base elements are present before injecting
      if (plateInput && imagesDiv && refDisplaySpan?.textContent) {
        // Prevent repeated injections
        if (
          document.getElementById("clonedPlateInput") ||
          document.getElementById("ticket-summary-box")
        ) {
          return;
        }

        // --- Inject Cloned Plate Input ---
        const clonedInput = plateInput.cloneNode(false) as HTMLInputElement;
        clonedInput.id = "clonedPlateInput";
        clonedInput.name = "clonedPlateInput";
        imagesDiv.appendChild(clonedInput);
        clonedInput.addEventListener("input", () => {
          const selStart = clonedInput.selectionStart || 0;
          const selEnd = clonedInput.selectionEnd || 0;
          const newValue = clonedInput.value.toUpperCase();
          if (newValue !== clonedInput.value) {
            clonedInput.value = newValue;
            clonedInput.selectionStart = selStart;
            clonedInput.selectionEnd = selEnd;
          }
          plateInput.value = clonedInput.value;
          plateInput.dispatchEvent(new Event("input", { bubbles: true }));
        });
        plateInput.addEventListener("input", () => {
          clonedInput.value = plateInput.value;
        });
        setTimeout(() => {
          clonedInput.value = plateInput.value;
          console.log(
            "[Debug] Cloned input's initial value set to:",
            clonedInput.value
          );
        }, 1000);
        const plateInputGrandparentDiv =
          plateInput.parentElement?.parentElement;
        if (plateInputGrandparentDiv) {
          const handleVisibilitySync = () => {
            clonedInput.style.display =
              plateInputGrandparentDiv.classList.contains("dform_hidden")
                ? "none"
                : "";
          };
          handleVisibilitySync();
          const visibilityObserver = new MutationObserver(handleVisibilitySync);
          visibilityObserver.observe(plateInputGrandparentDiv, {
            attributes: true,
            attributeFilter: ["class"],
          });
        } else {
          console.error("Could not find grandparent div for visibility sync.");
        }
        // --- End Cloned Plate Input ---

        // --- Inject Ticket Summary Box Structure ---
        const summaryBoxElement = document.createElement("div");
        summaryBoxElement.id = "ticket-summary-box";
        summaryBoxElement.dataset.populated = "false";
        summaryBoxElement.style.position = "fixed"; // Position is fixed
        summaryBoxElement.style.cursor = "grab"; // Indicate draggable

        // Apply other styles
        Object.assign(summaryBoxElement.style, {
          maxWidth: "180px",
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "5px",
          padding: "5px",
          paddingTop: "5px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          zIndex: "10000",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "2px",
          fontSize: "11px",
          transition: "height 0.3s ease, padding 0.3s ease",
          overflow: "hidden",
        });

        // --- Set Initial Position ---
        getSummaryBoxPosition().then((savedPos) => {
          if (savedPos.top !== null && savedPos.left !== null) {
            summaryBoxElement.style.top = `${savedPos.top}px`;
            summaryBoxElement.style.left = `${savedPos.left}px`;
            summaryBoxElement.style.bottom = "auto"; // Clear potentially conflicting styles
            summaryBoxElement.style.right = "auto";
            console.log(
              `[Debug] Applied saved position: top=${savedPos.top}, left=${savedPos.left}`
            );
          } else {
            // Use calculated offset or default
            let initialLeft = "auto";
            let initialRight = "20px"; // Default right alignment
            if (summaryBoxLeftOffset !== null) {
              initialLeft = `${summaryBoxLeftOffset}px`;
              initialRight = "auto";
            }
            summaryBoxElement.style.bottom = "100px"; // Default bottom
            summaryBoxElement.style.left = initialLeft;
            summaryBoxElement.style.right = initialRight;
            console.log(
              `[Debug] Applied default position: bottom=100px, left=${initialLeft}, right=${initialRight}`
            );
          }
        });
        // --- End Set Initial Position ---

        const contentWrapperElement = document.createElement("div");
        contentWrapperElement.style.display = "contents";
        contentWrapperElement.innerHTML =
          '<div style="text-align: center; font-style: italic; color: #888;">...</div>';
        summaryBoxElement.appendChild(contentWrapperElement);

        const toggleButtonElement = document.createElement("div");
        toggleButtonElement.style.position = "absolute";
        toggleButtonElement.style.top = "2px";
        toggleButtonElement.style.right = "4px";
        toggleButtonElement.style.cursor = "pointer";
        toggleButtonElement.style.fontSize = "14px";
        toggleButtonElement.style.lineHeight = "1";
        toggleButtonElement.title = "Minimize/Expand Summary";
        summaryBoxElement.appendChild(toggleButtonElement);

        const setMinimizedState = (minimized: boolean) => {
          const box = document.getElementById("ticket-summary-box");
          const content = box?.querySelector(
            "div:not([style*='position: absolute'])"
          );
          const toggle = box?.querySelector("div[style*='position: absolute']");
          if (!box || !content || !toggle) return;
          if (minimized) {
            box.style.height = "16px";
            box.style.padding = "3px 12px";
            box.style.paddingTop = "2px";
            (content as HTMLElement).style.display = "none";
            toggle.innerHTML = "▲";
          } else {
            box.style.height = "";
            box.style.padding = "5px";
            box.style.paddingTop = "5px";
            (content as HTMLElement).style.display = "contents";
            toggle.innerHTML = "▼";
          }
        };

        toggleButtonElement.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent drag from starting on toggle click
          const box = document.getElementById("ticket-summary-box");
          const content = box?.querySelector(
            "div:not([style*='position: absolute'])"
          );
          if (!content) return;
          const isCurrentlyMinimized =
            (content as HTMLElement).style.display === "none";
          setMinimizedState(!isCurrentlyMinimized);
          saveSummaryBoxState(!isCurrentlyMinimized);
        });

        getSummaryBoxState().then((isMinimized) => {
          setTimeout(() => setMinimizedState(isMinimized), 0);
        });

        // --- Add Drag Functionality ---
        addDragFunctionality(summaryBoxElement, toggleButtonElement);
        // --- End Add Drag Functionality ---

        imagesDiv.appendChild(summaryBoxElement);
        console.log("[Debug] Ticket Summary Box structure injected.");
        // --- End Ticket Summary Box Injection ---
      } else {
        // console.log("[Debug] Not all elements ready for injection...");
      }
    };

    // --- Function to Populate Summary Box Data ---
    const populateSummaryBox = () => {
      const summaryBox = document.getElementById("ticket-summary-box");
      if (!summaryBox || summaryBox.dataset.populated === "true") {
        return;
      }
      const contentWrapper = summaryBox.querySelector(
        "div:not([style*='position: absolute'])"
      ) as HTMLDivElement;
      if (!contentWrapper) return;
      const baseSelector = `.dform_widget > table > tbody > tr:nth-child`;
      const requiredFieldSelectors = [
        `${baseSelector}(3) > td:nth-child(2) > strong > span`, // Speed Limit
        `${baseSelector}(4) > td:nth-child(2) > strong > span`, // Vehicle Speed
        `${baseSelector}(5) > td:nth-child(2) > strong > span`, // Location
        `${baseSelector}(6) > td:nth-child(2) > strong > span`, // Violation Time
        `${baseSelector}(11) > td:nth-child(2) > strong > span`, // Total Fee
      ];
      const allFieldsReady = requiredFieldSelectors.every((selector) => {
        const element = document.querySelector(selector);
        return element?.textContent?.trim();
      });
      if (!allFieldsReady) {
        return;
      }
      console.log("[Debug] Populating Ticket Summary Box data...");
      const safeQuery = (selector: string): string => {
        const el = document.querySelector(selector);
        if (!el?.textContent) {
          console.warn(`Summary Box: Missing element or text for ${selector}`);
          return '<i style="color: orange;">Missing</i>';
        }
        return el.textContent.trim();
      };
      contentWrapper.innerHTML = "";
      const locationRaw = safeQuery(
        `${baseSelector}(5) > td:nth-child(2) > strong > span`
      );
      const locationElement = document.createElement("div");
      locationElement.innerHTML = locationRaw;
      // Apply styles, using setProperty for fontSize with !important
      locationElement.style.setProperty("font-size", "11px", "important");
      Object.assign(locationElement.style, {
        lineHeight: "1.1", // Tighter line height
        whiteSpace: "normal",
        wordBreak: "break-word",
      });
      contentWrapper.appendChild(locationElement);
      const timeRaw = safeQuery(
        `${baseSelector}(6) > td:nth-child(2) > strong > span`
      );
      const timeElement = document.createElement("div");
      const timeMatch = timeRaw.match(
        /(\w+), (\w+ \d+, \d+) at (\d+:\d+[APM]+)/
      );
      if (timeMatch && timeMatch.length === 4) {
        const shortWeekday = timeMatch[1].substring(0, 3);
        timeElement.textContent = `${shortWeekday}, ${timeMatch[2]} ${timeMatch[3]}`;
      } else {
        timeElement.innerHTML = timeRaw;
      }
      timeElement.style.setProperty("font-size", "12px", "important");
      contentWrapper.appendChild(timeElement);
      const vehicleSpeedRaw = safeQuery(
        `${baseSelector}(4) > td:nth-child(2) > strong > span`
      );
      const speedLimitRaw = safeQuery(
        `${baseSelector}(3) > td:nth-child(2) > strong > span`
      );
      const speedElement = document.createElement("div");
      const vs = vehicleSpeedRaw.includes("Missing") ? "?" : vehicleSpeedRaw;
      const sl = speedLimitRaw.includes("Missing") ? "?" : speedLimitRaw;
      speedElement.innerHTML = `${vs} / ${sl}`;

      // If vehicle speed greater than 30 over the limit, color red and bold
      const vehicleSpeed = parseInt(vehicleSpeedRaw);
      const speedLimit = parseInt(speedLimitRaw);
      if (!isNaN(vehicleSpeed) && !isNaN(speedLimit)) {
        if (vehicleSpeed >= speedLimit + 30) {
          speedElement.style.color = "red";
          speedElement.style.fontWeight = "bold";
        }
      }
      speedElement.style.setProperty("font-size", "12px", "important");
      speedElement.style.setProperty("line-height", "1");
      contentWrapper.appendChild(speedElement);
      const feeRaw = safeQuery(
        `${baseSelector}(11) > td:nth-child(2) > strong > span`
      );
      const feeElement = document.createElement("div");
      feeElement.innerHTML = feeRaw.includes("Missing") ? feeRaw : `$${feeRaw}`;
      feeElement.style.setProperty("font-size", "12px", "important");
      contentWrapper.appendChild(feeElement);
      summaryBox.dataset.populated = "true";
      console.log("[Debug] Ticket Summary Box data populated.");
    };
    // --- End Populate Function ---

    // --- Drag Functionality ---
    function addDragFunctionality(
      element: HTMLElement,
      dragHandleExclude: HTMLElement
    ) {
      let isDragging = false;
      let offsetX = 0;
      let offsetY = 0;

      const onMouseDown = (e: MouseEvent) => {
        // Ignore drag if click is on the minimize button
        if (e.target === dragHandleExclude) {
          return;
        }
        isDragging = true;
        // Calculate offset from the element's top-left corner
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
        element.style.cursor = "grabbing";
        element.style.userSelect = "none"; // Prevent text selection during drag

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        // Calculate new position
        let newTop = e.clientY - offsetY;
        let newLeft = e.clientX - offsetX;

        // Basic boundary checks (optional, adjust as needed)
        newTop = Math.max(
          0,
          Math.min(newTop, window.innerHeight - element.offsetHeight)
        );
        newLeft = Math.max(
          0,
          Math.min(newLeft, window.innerWidth - element.offsetWidth)
        );

        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;
        element.style.right = "auto"; // Ensure right/bottom are not interfering
        element.style.bottom = "auto";
      };

      const onMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;
        element.style.cursor = "grab";
        element.style.removeProperty("user-select");

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        // Save the final position (parse pixel values)
        const finalTop = parseFloat(element.style.top);
        const finalLeft = parseFloat(element.style.left);
        if (!isNaN(finalTop) && !isNaN(finalLeft)) {
          saveSummaryBoxPosition(finalTop, finalLeft);
        }
      };

      element.addEventListener("mousedown", onMouseDown);
    }
    // --- End Drag Functionality ---

    // Try to inject structure and populate data once initially
    tryInjectComponents();
    setTimeout(populateSummaryBox, 500); // Attempt population shortly after initial load

    // Set up a MutationObserver on the entire body
    const observer = new MutationObserver(() => {
      // Each time something changes, try to inject the structure if missing
      tryInjectComponents();
      // And try to populate the data if the structure exists but data is missing
      populateSummaryBox();
    });

    // Observe the body for child additions and subtree modifications
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
