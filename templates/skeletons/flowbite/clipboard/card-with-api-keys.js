window.addEventListener('load', function() {
    const clipboardAccountID = FlowbiteInstances.getInstance('CopyClipboard', 'account-id');
    const clipboardExternalID = FlowbiteInstances.getInstance('CopyClipboard', 'api-key');
    const clipboardRoleARN = FlowbiteInstances.getInstance('CopyClipboard', 'role-arn');

    const tooltipAccountID = FlowbiteInstances.getInstance('Tooltip', 'tooltip-account-id');
    const tooltipExternalID = FlowbiteInstances.getInstance('Tooltip', 'tooltip-api-key');
    const tooltipRoleARN = FlowbiteInstances.getInstance('Tooltip', 'tooltip-role-arn');

    const clipboards = [
        {
            clipboard: clipboardAccountID,
            tooltip: tooltipAccountID,
            defaultMessage: document.getElementById('default-tooltip-message-account-id'),
            successMessage: document.getElementById('success-tooltip-message-account-id'),
            defaultIcon: document.getElementById('default-icon-account-id'),
            successIcon: document.getElementById('success-icon-account-id')
        },
        {
            clipboard: clipboardExternalID,
            tooltip: tooltipExternalID,
            defaultMessage: document.getElementById('default-tooltip-message-api-key'),
            successMessage: document.getElementById('success-tooltip-message-api-key'),
            defaultIcon: document.getElementById('default-icon-api-key'),
            successIcon: document.getElementById('success-icon-api-key')
        },
        {
            clipboard: clipboardRoleARN,
            tooltip: tooltipRoleARN,
            defaultMessage: document.getElementById('default-tooltip-message-role-arn'),
            successMessage: document.getElementById('success-tooltip-message-role-arn'),
            defaultIcon: document.getElementById('default-icon-role-arn'),
            successIcon: document.getElementById('success-icon-role-arn')
        }
    ]

    clipboards.forEach((item) => {
        item.clipboard.updateOnCopyCallback(() => {
            showSuccess(item.defaultMessage, item.successMessage);
            showSuccess(item.defaultIcon, item.successIcon);
            item.tooltip.show();

            // reset to default state
            setTimeout(() => {
                resetToDefault(item.defaultMessage, item.successMessage);
                resetToDefault(item.defaultIcon, item.successIcon);
                item.tooltip.hide();
            }, 2000);
        })
    })

    const showSuccess = ($defaultEl, $successEl) => {
        $defaultEl.classList.add('hidden');
        $successEl.classList.remove('hidden');
    }

    const resetToDefault = ($defaultEl, $successEl) => {
        $defaultEl.classList.remove('hidden');
        $successEl.classList.add('hidden');
    }
})
