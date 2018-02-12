import * as ActionTypes from '../constants/ActionTypes';
import { MovementActions, PurchaseStage } from '../constants/Enums';
import { purchasePlot as purchasePlotFromChain } from './DataActions';

export function togglePurchaseFlow() {
  return {
    type: ActionTypes.TOGGLE_PURCHASE_FLOW
  };
}

export function purchaseImageSelected(imageFileInfo, plots) {
  return {
    type: ActionTypes.PURCHASE_IMAGE_SELECTED,
    imageFileInfo,
    plots
  }
}

export function transformRectToPurchase(delta, plots) {
  return {
    type: ActionTypes.TRANSFORM_RECT_TO_PURCHASE,
    delta,
    plots
  }
}

export function startTransformRectToPurchase(startLocation, transformAction) {
  return {
    type: ActionTypes.START_TRANSFORM_RECT,
    startLocation,
    transformAction
  }
}

export function stopTransformRectToPurchase() {
  return {
    type: ActionTypes.STOP_TRANSFORM_RECT
  }
}

export function completePurchaseStep(index, wasSkipped) {
  return {
    type: ActionTypes.COMPLETE_PURCHASE_STEP,
    index,
    wasSkipped
  };
}

export function goToPurchaseStep(index) {
  return {
    type: ActionTypes.GO_TO_PURCHASE_STEP,
    index
  };
}

export function changePlotWebsite(website, websiteValidation) {
  return {
    type: ActionTypes.CHANGE_PLOT_WEBSITE,
    website,
    websiteValidation
  };
}

export function changePlotBuyout(buyoutPriceInWei) {
  return {
    type: ActionTypes.CHANGE_PLOT_BUYOUT,
    buyoutPriceInWei
  };
}

export function changeBuyoutEnabled(isEnabled) {
  return {
    type: ActionTypes.CHANGE_BUYOUT_ENABLED,
    isEnabled
  };
}

// Thunk action for purchasing a plot. This requires uploading the image, submitting it to the chain, and waiting for transformations
export function completePlotPurchase(contractInfo, plots, rectToPurchase, imageData, ipfsHost, website, initialBuyout) {
  return function (dispatch) {
    dispatch(startPurchasePlot());

    return dispatch(uploadImageData(imageData, ipfsHost)).then((ipfsHash) => {
      return dispatch(purchasePlotFromChain(contractInfo, plots, rectToPurchase, website, ipfsHash, changePurchaseStep));
    });
  };
}

export function cancelPlotPurchase() {
  return {
    type: ActionTypes.CANCEL_PLOT_PURCHASE
  }
}

function startPurchasePlot() {
  return {
    type: ActionTypes.START_PURCHASING_PLOT
  };
}

function uploadImageData(imageData, ipfsHost) {
  return function(dispatch) {
    dispatch(changePurchaseStep(PurchaseStage.UPLOADING_TO_IPFS));



//   tryUpload(file) {
//     // Experiment here
//     var formData = new FormData();
//     formData.append('uploader', 'abc123');
//     formData.append('image', file);

//     fetch('http://127.0.0.1:3001/upload', {
//       method: 'PUT',
//       body: formData,
//       headers: {
//         'token': 'abc123'
//       }
//     })
//     .then(response => response.json())
//     .then(jsonResponse => {
//       const hash = jsonResponse.ipfsHash;
//     });
// }

    debugger;
    // First we call to get an upload token
    return fetch(`${ipfsHost}/token`).then(response => {
      return response.json();
    }).then((tokenResponse) => {
      return tokenResponse.token;
    }).then((token) => {
      const formData = new FormData();
      formData.append('uploader', 'its me');
      formData.append('image', imageData);

      return fetch(`${ipfsHost}/upload`, {
        method: 'PUT',
        body: formData,
        headers: {
          token: token
        }
      })
    }).then((uploadResponse) => {
      return uploadResponse.json();
    }).then((jsonResponse) => {
      const ipfsHash = jsonResponse.ipfsHash;
      return ipfsHash;
    }).then((ipfsHash) => {

      // Here's where we upload the image data to S3
      dispatch(changePurchaseStep(PurchaseStage.SAVING_TO_CLOUD));

      return new Promise((resolve2, reject2) => {
        setTimeout(() => resolve2(ipfsHash), 500);
      });
    })
  };
}

function changePurchaseStep(purchaseStage) {
  return {
    type: ActionTypes.CHANGE_PURCHASE_STAGE,
    purchaseStage
  }
}
