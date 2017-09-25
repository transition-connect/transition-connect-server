export function getExportMessage(npsConfig) {
    let exportMessage = [];
    for (let np of npsConfig) {
        if (np.isExported) {
            let exportedNp = {platformId: np.platformId, categories: []};
            for (let category of np.categories) {
                if (category.isSelected) {
                    exportedNp.categories.push(category.categoryId);
                }
            }
            exportMessage.push(exportedNp);
        }
    }
    return exportMessage;
}

export function isValidConfig(npsConfig) {
    let isValid = true;
    for (let np of npsConfig) {
        if (np.isExported) {
            let onlyDeactivated = true;
            for (let category of np.categories) {
                if (category.isSelected) {
                    onlyDeactivated = false;
                }
            }
            if (onlyDeactivated) {
                isValid = false;
            }
        }
    }
    return isValid;
}
