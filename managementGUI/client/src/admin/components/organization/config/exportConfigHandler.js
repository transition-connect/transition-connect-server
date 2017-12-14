export function getExportMessage(npsConfig) {
    let exportMessage = [];
    for (let np of npsConfig) {
        if (np.isExported) {
            let exportedNp = {platformId: np.platformId, org: {categories: []}, events: {}};
            for (let category of np.categories) {
                if (category.isSelected) {
                    exportedNp.org.categories.push(category.categoryId);
                }
            }
            exportedNp.events.exportActive = np.isEventExported;
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
