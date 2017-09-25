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

