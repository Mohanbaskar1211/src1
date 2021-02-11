var itemAddeddata = [];
const productViewModel = {
  // Product list observable
  products: ko.observableArray([]),
  // Search input observable
  searchKeyword: ko.observable(""),
  // Product detail observable
  productDetail: ko.observable(),
  pilotOffering: ko.observable(""),
  addOnOffering: ko.observable(""),
  statusOptions: ["Created", "Assigned", "Accepted", "Completed", "Canceled"],
  selectedStatus: ko.observable(""),
  addOnOfferingId: ko.observable(""),
  // Offering Options
  offeringOptions: ko.observableArray([]),
  savedOffersFlag: ko.observable(false),
  // Generated offers
  productOffers: ko.mapping.fromJS([]),
  selectAllOffersFlag: ko.observable(false),
  addToOffering: ko.observableArray([]),
  itemSearchkeyword: ko.observable(""),
  itemAdded: ko.observableArray([]),
  itemIcon: ko.observable(""),
  accessModelOptions: ko.observableArray(
    _.find(offeringOptionsMaster, ["headerId", "accessModel"]).options
  ),
  termOptions: ko.observableArray(
    _.find(offeringOptionsMaster, ["headerId", "term"]).options
  ),
  intendedUsageOptions: ko.observableArray(
    _.find(offeringOptionsMaster, ["headerId", "intendedUsage"]).options
  ),
  connectivityOptions: ko.observableArray(
    _.find(offeringOptionsMaster, ["headerId", "connectivity"]).options
  ),
  connectivityIntervalOptions: ko.observableArray(
    _.find(offeringOptionsMaster, ["headerId", "connectivityInterval"]).options
  ),
  billingBehaviorOptions: ko.observableArray(
    _.find(offeringOptionsMaster, ["headerId", "billingBehavior"]).options
  ),
  // Search product button handler
  resetProperties: function () {
    productViewModel.productDetail(null);
    productViewModel.pilotOffering("");
    productViewModel.addOnOffering("");
    productViewModel.selectedStatus("");
    productViewModel.addOnOfferingId("");
    productViewModel.offeringOptions([]);
    productViewModel.productOffers.removeAll();
  },
  searchProducts: function (viewAll) {
    if (viewAll) {
      productViewModel.searchKeyword("");
    }
    var getProductApi = productViewModel.searchKeyword()
      ? "https://sandbox.webcomcpq.com/setup/api/v1/admin/products?quickFilter=" +
        productViewModel.searchKeyword()
      : "https://sandbox.webcomcpq.com/setup/api/v1/admin/products";

    $.ajax({
      type: "GET",
      url: getProductApi,
      contentType: "application/json; charset=utf-8",
      headers: { Authorization: retriveAuthToken() },
    })
      .done(function (data) {
        productViewModel.products(data.pagedRecords);
        sendPostMessage();
      })
      .fail(function () {
        toastr.error("failed to get products.");
      });
  },
  // Screen-5 'Start'
			itemSearch: function (itemval) {

				console.log('itemval------'+itemval);
				if(itemval == true)
				{
					productViewModel.itemSearchkeyword("")
				}
				if(productViewModel.itemSearchkeyword().length > 0 || (itemval == true))
				{
					$.ajax({
						type: "GET",
						url: "https://sandbox.webcomcpq.com/customapi/executescript?scriptName=GetItemsApi&username=t_smili_integration&password=Apriori!123&domain=autodeskinc_dev",
						data: {"Param":'{"ItemName":"'+productViewModel.itemSearchkeyword()+'"}'},
						dataType: "json",
						contentType: "application/json; charset=utf-8",
					})
					  .done(function (data) {

						  data1 = JSON.parse(data);
						  console.log(data1);
						productViewModel.addToOffering(data1);
						sendPostMessage();
					  })
					  .fail(function () {
						toastr.error("failed to get products.");
					  });
				}
				if(itemval !=true && itemval !=false)
				{
					console.log('1111111');
					console.log(data1);

					console.log('json_data----------111111');

					var plus_hide = '.fa-plus-circle.'+itemval

					for (var i = 0; i < data1.length; ++i) {
						if (data1[i].ItemCode == itemval){
							itemAddeddata.push(data1[i]);
							productViewModel.itemIcon(true);
							var plusIconChange = '.fa-plus-circle.'+itemval;
							var newIcon = '.fa-check.'+itemval;
							$(plusIconChange).addClass('d-none');
							$(newIcon).removeClass('d-none').addClass('d-inline');
						}
					}
					productViewModel.itemAdded(itemAddeddata);

				}
			},

 itemDelete: function (itemval) {
   console.log('ttttttttt');
   console.log(itemval);
   var itemsJson = 	productViewModel.itemAdded();
   var findIndex = itemsJson.findIndex(a => a.CpqTableEntryId === itemval)
   findIndex !== -1 && itemsJson.splice(findIndex , 1)
   console.log(itemsJson);
   productViewModel.itemAdded(itemsJson);
      },
  // Screen-5 'End'
  // Dynamic search result text on top of table
  searchResultText: ko.pureComputed(function () {
    return productViewModel.searchKeyword()
      ? productViewModel.products().length +
          " RESULTS FOUND FOR " +
          productViewModel.searchKeyword()
      : productViewModel.products().length + " RESULTS FOUND";
  }),
  // Configure button handler
  configureProduct: function (product) {
    $.ajax({
      type: "GET",
      url:
        "https://sandbox.webcomcpq.com/setup/api/v1/admin/products/" +
        product.id,
      contentType: "application/json; charset=utf-8",
      headers: { Authorization: retriveAuthToken() },
    }).done(function (data) {
      $("#adsk-select-offering-tab").removeClass("active");
      $("#adsk-select-offering").removeClass("show active");
      $("#adsk-add-details-tab").addClass("active");
      $("#adsk-add-details").addClass("show active");

      var detailResponse = data;
      // Add addition fields from selected product
      detailResponse.type = product.type;
      detailResponse.displayType = product.displayType;
      detailResponse.category = product.category;

      productViewModel.productDetail(detailResponse);

      if (data.image) {
        var imageId = data.image;
        productViewModel.previewImage(imageId);
      }
    });

    // Get product extension table details
    var productExtensionAPI =
      "https://sandbox.webcomcpq.com/customapi/executescript?scriptName=ProductExtensionAPI&username=t_smili_integration&password=Apriori!123&domain=autodeskinc_dev";

    var input = '{"ProductID": "0000000"}';
    var inputJson = { Param: input.replace(/0000000/g, product.id) };

    $.ajax({
      type: "GET",
      url: productExtensionAPI,
      data: $.param(inputJson),
      processData: false,
      contentType: "application/json; charset=utf-8",
    })
      .done(function (data) {
        var response = data.replace(/'/g, '"');
        var parsedResponse = JSON.parse(response);
        productViewModel.pilotOffering(parsedResponse.PilotOfferingId);
        productViewModel.addOnOffering(
          parsedResponse.AddOnOfferingId ? "yes" : "no"
        );
        productViewModel.addOnOfferingId(parsedResponse.AddOnOfferingId);
        productViewModel.selectedStatus(parsedResponse.State);

        sendPostMessage();
      })
      .fail(function () {
        toastr.error("failed to get extended product details.");
      });
  },
  // Back button handler
  backButtonClick: function (
    currentTab,
    currentTabPanel,
    previousTab,
    previousTabPanel
  ) {
    $(currentTab).removeClass("active");
    $(currentTabPanel).removeClass("show active");
    $(previousTab).addClass("active");
    $(previousTabPanel).addClass("show active");

    productViewModel.resetProperties();
  },
  // Cancel button handler
  cancelButtonClick: function (currentTab, currentTabPanel) {
    $(currentTab).removeClass("active");
    $(currentTabPanel).removeClass("show active");
    $("#adsk-select-offering-tab").addClass("active");
    $("#adsk-select-offering").addClass("show active");

    productViewModel.resetProperties();
  },
  saveProductImage: function (imageId) {
    var product = productViewModel.productDetail();
    product.image = imageId;
    $.ajax({
      type: "POST",
      url: "https://sandbox.webcomcpq.com/setup/api/v1/admin/products",
      data: JSON.stringify(product),
      contentType: "application/json; charset=utf-8",
      headers: { Authorization: retriveAuthToken() },
    })
      .done(function (data) {
        toastr.success("Product Image uploaded");
      })
      .fail(function () {
        toastr.error("failed to save product image.");
      });
  },
  // Save For Later button handler
  saveForLaterButtonClick: function (currentTab, currentTabPanel) {
    if (
      productViewModel.productDetail().id &&
      productViewModel.pilotOffering() &&
      productViewModel.addOnOffering() &&
      productViewModel.selectedStatus()
    ) {
      var createProductExtensionApi =
        "https://sandbox.webcomcpq.com/customapi/executescript?scriptName=CreateProductExtensioApi&username=t_smili_integration&password=Apriori!123&domain=autodeskinc_dev";

      var inputObj = {
        Param: JSON.stringify({
          ProductId: productViewModel.productDetail().id,
          PilotOfferingId: productViewModel.pilotOffering(),
          AddOnOfferingId: productViewModel.addOnOfferingId(),
          State: productViewModel.selectedStatus(),
        }),
      };

      $.ajax({
        type: "POST",
        url: createProductExtensionApi,
        data: JSON.stringify(inputObj),
        contentType: "application/json; charset=utf-8",
      })
        .done(function (data) {
          if (data && data.Status == "Success") {
            toastr.success("product details saved successfully");
            $(currentTab).removeClass("active");
            $(currentTabPanel).removeClass("show active");
            $("#adsk-select-offering-tab").addClass("active");
            $("#adsk-select-offering").addClass("show active");
            productViewModel.resetProperties();
          } else {
            toastr.error("failed to save extended product details.");
          }
        })
        .fail(function () {
          toastr.error("failed to save extended product details.");
        });
    } else {
      toastr.error("Please provide details for all required fields.");
    }
  },
  // Close current tab and redirect to next tab
  redirectToNextTab: function (
    currentTab,
    currentTabPanel,
    nextTab,
    nextTabPanel
  ) {
    $(currentTab).removeClass("active");
    $(currentTabPanel).removeClass("show active");
    $(nextTab).addClass("active");
    $(nextTabPanel).addClass("show active");
  },
  // Continue button handler
  continueButtonClick: function (
    currentTab,
    currentTabPanel,
    nextTab,
    nextTabPanel
  ) {
    if (
      productViewModel.productDetail().id &&
      productViewModel.pilotOffering() &&
      productViewModel.addOnOffering() &&
      productViewModel.selectedStatus()
    ) {
      // Save product extension table details
      var createProductExtensionApi =
        "https://sandbox.webcomcpq.com/customapi/executescript?scriptName=CreateProductExtensioApi&username=t_smili_integration&password=Apriori!123&domain=autodeskinc_dev";

      var inputObj = {
        Param: JSON.stringify({
          ProductId: productViewModel.productDetail().id,
          PilotOfferingId: productViewModel.pilotOffering(),
          AddOnOfferingId: productViewModel.addOnOfferingId(),
          State: productViewModel.selectedStatus(),
        }),
      };

      $.ajax({
        type: "POST",
        url: createProductExtensionApi,
        data: JSON.stringify(inputObj),
        contentType: "application/json; charset=utf-8",
      })
        .done(function (data) {
          if (data && data.Status == "Success") {
            toastr.success("product details saved successfully");

            var masterOptions = offeringOptionsMaster;
            // Get product extension table details
            var GetofferselectionsApi =
              "https://sandbox.webcomcpq.com/customapi/executescript?scriptName=GetofferselectionsApi&username=t_smili_integration &password=Apriori!123&domain=autodeskinc_dev";

            var input = '{"ProductID": "0000000"}';
            var inputJson = {
              Param: input.replace(
                /0000000/g,
                productViewModel.productDetail().id
              ),
            };

            $.ajax({
              type: "GET",
              url: GetofferselectionsApi,
              data: $.param(inputJson),
              processData: false,
              contentType: "application/json; charset=utf-8",
            })
              .done(function (data) {
                var response1 = data.replace(/'{/g, "{");
                var response2 = response1.replace(/}'/g, "}");
                var response = response2.replace(/'/g, '"');
                var parsedResponse = JSON.parse(response);

                if (!_.isEmpty(parsedResponse)) {
                  productViewModel.savedOffersFlag(true);
                  var mergedOptions = _(masterOptions).forEach(function (
                    param
                  ) {
                    var savedOptions =
                      parsedResponse.Selections[param.headerId];
                    _(param.options).forEach(function (option) {
                      if (_.includes(savedOptions, option.text)) {
                        option.checked = true;
                      }
                    });
                  });
                  productViewModel.offeringOptions(mergedOptions);
                } else {
                  productViewModel.savedOffersFlag(false);
                  productViewModel.offeringOptions(masterOptions);
                }
                productViewModel.redirectToNextTab(
                  currentTab,
                  currentTabPanel,
                  nextTab,
                  nextTabPanel
                );
                sendPostMessage();
              })
              .fail(function () {
                toastr.error("failed to get extended product details.");
              });
          } else {
            toastr.error("failed to save extended product details.");
          }
        })
        .fail(function () {
          toastr.error("failed to save extended product details.");
        });
    } else {
      toastr.error("Please provide details for all required fields.");
    }
  },
  // Generate offers button handler
  generateOffer: function (currentTab, currentTabPanel, nextTab, nextTabPanel) {
    var validationMsg = "";
    var selectedOfferingOptions = productViewModel.offeringOptions();
    _(selectedOfferingOptions).forEach(function (attribute) {
      if (!_.some(attribute.options, { checked: true })) {
        validationMsg += attribute.headerText + "</br>";
      }
    });
    if (validationMsg) {
      validationMsg =
        "Please select one value from each, </br>" + validationMsg;
    }

    if (!validationMsg) {
      var saveofferselectionsApi =
        "https://sandbox.webcomcpq.com/customapi/executescript?scriptName=SaveofferselectionsApi&username=t_smili_integration &password=Apriori!123&domain=autodeskinc_dev";

      var inputObj = {
        Param: JSON.stringify({
          ProductId: productViewModel.productDetail().id,
          Selections: productViewModel.getSelections(selectedOfferingOptions),
        }),
      };

      $.ajax({
        type: "POST",
        url: saveofferselectionsApi,
        data: JSON.stringify(inputObj),
        contentType: "application/json; charset=utf-8",
      })
        .done(function (data) {
          if (data && data.Status == "Success") {
            toastr.success("Offer selections saved successfully.");
            // Get generate offer details
            var generateTableApi =
              "https://sandbox.webcomcpq.com/customapi/executescript?scriptName=GenerateTable&username=t_smili_integration &password=Apriori!123&domain=autodeskinc_dev";

            var input = '{"ProductID": "0000000"}';
            var inputJson = {
              Param: input.replace(
                /0000000/g,
                productViewModel.productDetail().id
              ),
            };

            $.ajax({
              type: "GET",
              url: generateTableApi,
              data: $.param(inputJson),
              processData: false,
              contentType: "application/json; charset=utf-8",
            })
              .done(function (data) {
                var response = data.replace(/'/g, '"');
                var parsedResponse = JSON.parse(response);
                _.forEach(parsedResponse, function (value, i) {
                  var obj = _.fromPairs(value.map((v) => [v.Name, v.Display]));
                  obj["id"] = i + 1;
                  obj["offerId"] = "Offer-" + (i + 1);
                  productViewModel.productOffers.push(new ProductOffer(obj));
                });
                sendPostMessage();
              })
              .fail(function () {
                toastr.error("failed to get generated offers.");
              });

            productViewModel.redirectToNextTab(
              currentTab,
              currentTabPanel,
              nextTab,
              nextTabPanel
            );
          } else {
            toastr.error("Failed to save offer selections.");
          }
        })
        .fail(function () {
          toastr.error("Failed to save offer selections.");
        });
    } else {
      toastr.warning(validationMsg);
    }
  },
  // Skip offer creation and continue to Confirm offers button handler
  skipOfferCreation: function (
    currentTab,
    currentTabPanel,
    nextTab,
    nextTabPanel
  ) {
    // Get product extension table details
    var getOffersAPi =
      "https://sandbox.webcomcpq.com/customapi/executescript?scriptName=GetOfferAPi&username=t_smili_integration &password=Apriori!123&domain=autodeskinc_dev";

    var input = '{"ProductID": "0000000"}';
    var inputJson = {
      Param: input.replace(/0000000/g, productViewModel.productDetail().id),
    };

    $.ajax({
      type: "GET",
      url: getOffersAPi,
      data: $.param(inputJson),
      processData: false,
      contentType: "application/json; charset=utf-8",
    })
      .done(function (data) {
        console.log(data);
        // var response = data.replace(/'/g, '"');
        // var parsedResponse = JSON.parse(response);
        // productViewModel.productOffers(newOffers);
        sendPostMessage();
      })
      .fail(function () {
        toastr.error("failed to get generated offers.");
      });

    productViewModel.redirectToNextTab(
      currentTab,
      currentTabPanel,
      nextTab,
      nextTabPanel
    );
  },
  // Save For Later Create Offers button handler
  sflCreateOffers: function (currentTab, currentTabPanel) {
    var validationMsg = "";
    var selectedOfferingOptions = productViewModel.offeringOptions();
    _(selectedOfferingOptions).forEach(function (attribute) {
      if (!_.some(attribute.options, { checked: true })) {
        validationMsg += attribute.headerText + "</br>";
      }
    });
    if (validationMsg) {
      validationMsg =
        "Please select one value from each, </br>" + validationMsg;
    }

    if (!validationMsg) {
      var saveofferselectionsApi =
        "https://sandbox.webcomcpq.com/customapi/executescript?scriptName=SaveofferselectionsApi&username=t_smili_integration &password=Apriori!123&domain=autodeskinc_dev";

      var inputObj = {
        Param: JSON.stringify({
          ProductId: productViewModel.productDetail().id,
          Selections: productViewModel.getSelections(selectedOfferingOptions),
        }),
      };

      $.ajax({
        type: "POST",
        url: saveofferselectionsApi,
        data: JSON.stringify(inputObj),
        contentType: "application/json; charset=utf-8",
      })
        .done(function (data) {
          if (data && data.Status == "Success") {
            toastr.success("Offer selections saved successfully.");

            $(currentTab).removeClass("active");
            $(currentTabPanel).removeClass("show active");
            $("#adsk-select-offering-tab").addClass("active");
            $("#adsk-select-offering").addClass("show active");
            productViewModel.resetProperties();
          } else {
            toastr.error("Failed to save offer selections.");
          }
        })
        .fail(function () {
          toastr.error("Failed to save offer selections.");
        });
    } else {
      toastr.warning(validationMsg);
    }
  },
  // Create offers Back button handler
  backCreateOffers: function (
    currentTab,
    currentTabPanel,
    previousTab,
    previousTabPanel
  ) {
    $(currentTab).removeClass("active");
    $(currentTabPanel).removeClass("show active");
    $(previousTab).addClass("active");
    $(previousTabPanel).addClass("show active");
    productViewModel.offeringOptions([]);
  },
  // Confirm offers Back button handler
  backConfirmOffers: function (
    currentTab,
    currentTabPanel,
    previousTab,
    previousTabPanel
  ) {
    $(currentTab).removeClass("active");
    $(currentTabPanel).removeClass("show active");
    $(previousTab).addClass("active");
    $(previousTabPanel).addClass("show active");
    productViewModel.productOffers.removeAll();
  },
  // Add New Offer button handler
  addOffer: function () {
    console.log("Add offer button clicked");
    productViewModel.productOffers().forEach(function (o) {
      if (o.isEdit()) {
        o.isEdit(false);
      }
    });
    var currentMaxId = _.maxBy(productViewModel.productOffers(), "id");
    var obj = {
      id: currentMaxId.id + 1,
      offerId: "Offer-" + (currentMaxId.id + 1),
      isEdit: true,
    };
    productViewModel.productOffers.unshift(new ProductOffer(obj));
  },
  // Edit Offer button handler
  editOffer: function (offer) {
    console.log("Edit offer button clicked");
    productViewModel.productOffers().forEach(function (o) {
      if (o.isEdit()) {
        o.isEdit(false);
      }
    });
    offer.isEdit(true);
  },
  // Copy Offer button handler
  copyOffer: function (offer) {
    console.log("Copy offer button clicked");
    productViewModel.productOffers().forEach(function (o) {
      if (o.isEdit()) {
        o.isEdit(false);
      }
    });
    var currentMaxId = _.maxBy(productViewModel.productOffers(), "id");
    var copyOffer = ko.mapping.toJS(offer);
    copyOffer.id = currentMaxId.id + 1;
    copyOffer.offerId = "Offer-" + (currentMaxId.id + 1);
    copyOffer.isEdit = true;

    var indexOfCurrentObj = _.findIndex(productViewModel.productOffers(), [
      "id",
      offer.id,
    ]);
    productViewModel.productOffers.splice(
      indexOfCurrentObj + 1,
      0,
      new ProductOffer(copyOffer)
    );
  },
  // Save Offer button handler
  saveOffer: function (offer) {
    console.log("Save offer button clicked");
    if (
      offer.accessModel() &&
      offer.billingBehavior() &&
      offer.connectivity() &&
      offer.connectivityInterval() &&
      offer.intendedUsage() &&
      offer.term() &&
      offer.status()
    ) {
      var duplicateOffer = _.find(
        productViewModel.productOffers(),
        function (o) {
          return (
            o.id != offer.id &&
            o.accessModel() === offer.accessModel() &&
            o.billingBehavior() === offer.billingBehavior() &&
            o.connectivity() === offer.connectivity() &&
            o.connectivityInterval() === offer.connectivityInterval() &&
            o.intendedUsage() === offer.intendedUsage() &&
            o.term() === offer.term()
          );
        }
      );
      if (duplicateOffer && duplicateOffer.id) {
        toastr.warning(
          "There is already an offer present for selected combination with OFFER ID: " +
            duplicateOffer.offerId
        );
      } else {
        if (offer.isEdit()) {
          offer.isEdit(false);
        }
      }
    } else {
      toastr.error("Please provide details for all required fields.");
    }
  },
  // Cancel Offer button handler
  cancelOffer: function (offer) {
    console.log("Cancel offer button clicked");
    console.log(offer);
    if (offer.isEdit()) {
      offer.isEdit(false);
    }
  },
  // Delete Offers button handler
  deleteOffer: function () {
    console.log("Delete offer button clicked");
    var removedOffers = productViewModel.productOffers.remove(function (offer) {
      return offer.isSelected();
    });
    var idsToRemove = _.reject(
      _.map(removedOffers, "CpqTableEntryId"),
      _.isEmpty
    );
    if (idsToRemove.length > 0) {
      var deleteOffersApi =
        "https://sandbox.webcomcpq.com/customapi/executescript?scriptName=DeleteOffersApi&username=t_smili_integration &password=Apriori!123&domain=autodeskinc_dev";

      var inputObj = {
        Param: JSON.stringify({
          CpqTableEntryId: idsToRemove,
        }),
      };

      $.ajax({
        type: "POST",
        url: deleteOffersApi,
        data: JSON.stringify(inputObj),
        contentType: "application/json; charset=utf-8",
      }).done(function (data) {
        if (data && data.Status == "Success") {
          toastr.success("Offers deleted successfully.");
        }
      });
    }
  },
  // Check if any row is in edit mode
  isEditMode: ko.pureComputed(function () {
    var index = _.findIndex(productViewModel.productOffers(), function (o) {
      return o.isEdit();
    });
    return index != -1;
  }),
  // Save For Later Confirm Offers button handler
  sflConfirmOffers: function (currentTab, currentTabPanel) {
    var validationMsg = "";
    var productOffers = ko.mapping.toJS(productViewModel.productOffers());
    var uniqueOffers = _.uniqWith(
      productOffers,
      (a, b) =>
        a.accessModel === b.accessModel &&
        a.billingBehavior === b.billingBehavior &&
        a.connectivity === b.connectivity &&
        a.connectivityInterval === b.connectivityInterval &&
        a.intendedUsage === b.intendedUsage &&
        a.term === b.term
    );
    var duplicateOffers = _.differenceWith(
      productOffers,
      uniqueOffers,
      (a, b) =>
        a.offerId === b.offerId &&
        a.accessModel === b.accessModel &&
        a.billingBehavior === b.billingBehavior &&
        a.connectivity === b.connectivity &&
        a.connectivityInterval === b.connectivityInterval &&
        a.intendedUsage === b.intendedUsage &&
        a.term === b.term
    );

    _.forEach(duplicateOffers, function (dupOffer) {
      var existingOffer = _.find(productOffers, function (o) {
        return (
          o.id != dupOffer.id &&
          o.accessModel === dupOffer.accessModel &&
          o.billingBehavior === dupOffer.billingBehavior &&
          o.connectivity === dupOffer.connectivity &&
          o.connectivityInterval === dupOffer.connectivityInterval &&
          o.intendedUsage === dupOffer.intendedUsage &&
          o.term === dupOffer.term
        );
      });
      validationMsg +=
        existingOffer.offerId + " : " + dupOffer.offerId + ",</br>";
    });

    if (validationMsg) {
      validationMsg = "Found duplicate combinations, </br>" + validationMsg;
    }

    if (!validationMsg) {
      var saveConfirmOffersApi =
        "https://sandbox.webcomcpq.com/customapi/executescript?scriptName=SaveOffer&username=t_smili_integration &password=Apriori!123&domain=autodeskinc_dev";

      var inputObj = {
        Param: JSON.stringify({
          ProductID: productViewModel.productDetail().id,
          offers: ko.mapping.toJS(productViewModel.productOffers()),
        }),
      };

      $.ajax({
        type: "POST",
        url: saveConfirmOffersApi,
        data: JSON.stringify(inputObj),
        contentType: "application/json; charset=utf-8",
      })
        .done(function (data) {
          console.log(data);
          if (data && data.Status == "Success") {
            toastr.success("Confirmed offers saved successfully.");

            $(currentTab).removeClass("active");
            $(currentTabPanel).removeClass("show active");
            $("#adsk-select-offering-tab").addClass("active");
            $("#adsk-select-offering").addClass("show active");
            productViewModel.resetProperties();
          } else {
            toastr.error("Failed to save confirmed offers.");
          }
        })
        .fail(function () {
          toastr.error("Failed to save confirmed offers.");
        });
    } else {
      toastr.error(validationMsg);
    }
  },
  // Continue button handler
  continueConfirmOffers: function (
    currentTab,
    currentTabPanel,
    nextTab,
    nextTabPanel
  ) {
    var validationMsg = "";
    var productOffers = ko.mapping.toJS(productViewModel.productOffers());
    var uniqueOffers = _.uniqWith(
      productOffers,
      (a, b) =>
        a.accessModel === b.accessModel &&
        a.billingBehavior === b.billingBehavior &&
        a.connectivity === b.connectivity &&
        a.connectivityInterval === b.connectivityInterval &&
        a.intendedUsage === b.intendedUsage &&
        a.term === b.term
    );
    var duplicateOffers = _.differenceWith(
      productOffers,
      uniqueOffers,
      (a, b) =>
        a.offerId === b.offerId &&
        a.accessModel === b.accessModel &&
        a.billingBehavior === b.billingBehavior &&
        a.connectivity === b.connectivity &&
        a.connectivityInterval === b.connectivityInterval &&
        a.intendedUsage === b.intendedUsage &&
        a.term === b.term
    );

    _.forEach(duplicateOffers, function (dupOffer) {
      var existingOffer = _.find(productOffers, function (o) {
        return (
          o.id != dupOffer.id &&
          o.accessModel === dupOffer.accessModel &&
          o.billingBehavior === dupOffer.billingBehavior &&
          o.connectivity === dupOffer.connectivity &&
          o.connectivityInterval === dupOffer.connectivityInterval &&
          o.intendedUsage === dupOffer.intendedUsage &&
          o.term === dupOffer.term
        );
      });
      validationMsg +=
        existingOffer.offerId + " : " + dupOffer.offerId + ",</br>";
    });

    if (validationMsg) {
      validationMsg = "Found duplicate combinations, </br>" + validationMsg;
    }

    if (!validationMsg) {
      var saveConfirmOffersApi =
        "https://sandbox.webcomcpq.com/customapi/executescript?scriptName=SaveOffer&username=t_smili_integration &password=Apriori!123&domain=autodeskinc_dev";

      var inputObj = {
        Param: JSON.stringify({
          ProductID: productViewModel.productDetail().id,
          offers: ko.mapping.toJS(productViewModel.productOffers()),
        }),
      };

      $.ajax({
        type: "POST",
        url: saveConfirmOffersApi,
        data: JSON.stringify(inputObj),
        contentType: "application/json; charset=utf-8",
      })
        .done(function (data) {
          console.log(data);
          if (data && data.Status == "Success") {
            toastr.success("Confirmed offers saved successfully.");

			// Screen-5 'Start'

			// Screen-5 'End'

            productViewModel.redirectToNextTab(
              currentTab,
              currentTabPanel,
              nextTab,
              nextTabPanel
            );
            sendPostMessage();
          } else {
            toastr.error("Failed to save confirmed offers.");
          }
        })
        .fail(function () {
          toastr.error("Failed to save confirmed offers.");
        });
    } else {
      toastr.error(validationMsg);
    }
  },
  getSelections: function (params) {
    var obj = {};
    _(params).forEach(function (param) {
      obj[param.headerId] = _.map(
        _.filter(param.options, { checked: true }),
        "text"
      );
    });
    return obj;
  },
  fileSelect: function (elemet, event) {
    var files = $("#adsk-image").get(0).files;
    var data = new FormData();
    for (var x = 0; x < files.length; x++) {
      data.append("file" + x, files[x]);
    }

    $.ajax({
      type: "POST",
      url: "https://sandbox.webcomcpq.com/api/v1/admin/files/ProductImage",
      data: data,
      enctype: "multipart/form-data",
      contentType: false,
      processData: false,
      cache: false,
      headers: { Authorization: retriveAuthToken() },
    })
      .done(function (data) {
        if (
          data &&
          data[0] &&
          (data[0].IsSuccess || data[0].ErrorMessage == "File already exists.")
        ) {
          var imageId = data[0].FileName;
          productViewModel.previewImage(imageId);
          productViewModel.saveProductImage(imageId);
        } else {
          toastr.error("failed to save image.");
        }
      })
      .fail(function () {
        toastr.error("failed to save image.");
      });
  },
  previewImage: function (imageId) {
    $.ajax({
      type: "GET",
      url:
        "https://sandbox.webcomcpq.com/api/v1/admin/files/ProductImage?id=" +
        imageId,
      cache: false,
      xhrFields: {
        responseType: "blob",
      },
      headers: { Authorization: retriveAuthToken() },
    })
      .done(function (data) {
        var imagePreview = document.getElementById("image-preview");
        var url = window.URL || window.webkitURL;
        imagePreview.src = url.createObjectURL(data);
      })
      .fail(function () {
        toastr.error("failed to get image.");
      });
  },
};
ko.applyBindings(
  productViewModel,
  document.getElementById("adsk-custom-offering")
);

// Call Access Token API and store token in local storage.
var baseUrl = "https://sandbox.webcomcpq.com/basic/api";
var getTokenUrl = baseUrl + "/token";

var adskAuthToken;
function getAccessTokenByPost() {
  if (adskAuthToken) {
    return $.Deferred().resolve().promise();
  } else {
    var postData = {
      grant_type: "password",
      username: "t_smili_integration",
      password: "Apriori!123",
      domain: "autodeskinc_dev",
    };
    return $.post(getTokenUrl, postData, null, "json")
      .done(function (data) {
        adskAuthToken = data.access_token;
        localStorage.setItem("adsk-access-token", data.access_token);
      })
      .fail(function (jqXHR, status, error) {
        toastr.error("getting Access Token failed.");
      });
  }
}

function retriveAuthToken() {
  var token = localStorage.getItem("adsk-access-token");
  return "Bearer " + token;
}

let height;
const sendPostMessage = () => {
  if (height !== document.getElementById("adsk-custom-offering").offsetHeight) {
    height = document.getElementById("adsk-custom-offering").offsetHeight;
    window.parent.postMessage(
      {
        frameHeight: height,
      },
      "*"
    );
  }
};

window.onload = () => sendPostMessage();
window.onresize = () => sendPostMessage();

$(function () {
  // Get access token on page load
  getAccessTokenByPost();

  // Disable non active tabs
  // $(".nav li").not(".active").find("a").addClass("disabled");
  // $(".nav li").not(".active").find("a").removeAttr("data-toggle");

  // Subscribe for Add-On Offering radio button
  productViewModel.addOnOffering.subscribe(function (value) {
    if (value == "no") {
      productViewModel.addOnOfferingId("");
    }
  });

  // Subscribe for select all offer checkbox
  productViewModel.selectAllOffersFlag.subscribe(function (value) {
    productViewModel.productOffers().forEach(function (o) {
      o.isSelected(value);
    });
  });
});

// ProductOffer ViewModel
var ProductOffer = function (data, parent) {
  this.id = data.id;
  this.CpqTableEntryId = data.CpqTableEntryId ? data.CpqTableEntryId : "";
  this.offerId = data.offerId;
  this.accessModel = ko.observable(data.accessModel ? data.accessModel : "");
  this.billingBehavior = ko.observable(
    data.billingBehavior ? data.billingBehavior : ""
  );
  this.connectivity = ko.observable(data.connectivity ? data.connectivity : "");
  this.connectivityInterval = ko.observable(
    data.connectivityInterval ? data.connectivityInterval : ""
  );
  this.intendedUsage = ko.observable(
    data.intendedUsage ? data.intendedUsage : ""
  );
  this.term = ko.observable(data.term ? data.term : "");
  this.startDate = ko.observable(
    data.startDate ? data.startDate : new Date().toISOString().slice(0, 10)
  );
  this.endDate = ko.observable(
    data.endDate ? data.endDate : new Date().toISOString().slice(0, 10)
  );
  this.status = ko.observable(data.status ? data.status : "Created");
  this.isSelected = ko.observable(data.isSelected ? data.isSelected : false);
  this.isEdit = ko.observable(data.isEdit ? data.isEdit : false);
};


/*Screen-5 'Start'*/
function to_view_all_item(){
	$.ajax({
        type: "GET",
        url: "https://sandbox.webcomcpq.com/customapi/executescript?scriptName=GetItemsApi&username=t_smili_integration&password=Apriori!123&domain=autodeskinc_dev",
        data: {"Param":'{"ItemName":""}'},
        dataType: "json",
        contentType: "application/json; charset=utf-8",
      })
        .done(function (data) {
			var json_data = JSON.parse(data);
			var gene_tbl = '';
			$(json_data).each(function(index){
				var dict_val = json_data[index];
				gene_tbl += '<tr>';
				for (key in dict_val)
				{
				  if(key == 'ItemName' || key == 'ProductLineCode' || key == 'StartDate' || key == 'EndDate')
				  {
					gene_tbl += '<td>'+dict_val[key]+'</td>';
				  }
				}
				gene_tbl += '<td class="text-center"><i class="fas fa-plus-circle"></i><i class="fas fa-check d-none"></i></td></tr>';
			});
			$('table#adsk-crt-comp-lft-tbl tbody').html(gene_tbl);
        })
        .fail(function () {
          console.log("failed to get extended product");
		})
}

/*Screen-5 'End'*/
