export default function sortFailed(failedAssets, errorName) {
  const failedGDArr = [];
  const failedOtherArr = [];

  failedAssets.forEach((assetFailed) => {
    const { error } = assetFailed;
    if (error.name === errorName) {
      failedGDArr.push(assetFailed);
      return;
    }
    failedOtherArr.push(assetFailed);
  });

  return { failedGDArr, failedOtherArr };
}
