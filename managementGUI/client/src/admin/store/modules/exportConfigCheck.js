export default function isValidConfig(npsConfig) {
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
