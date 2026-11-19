window.addEventListener('load', function() {
    const clipboard = FlowbiteInstances.getInstance('CopyClipboard', 'contact-details');
    const tooltip = FlowbiteInstances.getInstance('Tooltip', 'tooltip-contact-details');

    const $defaultIcon = document.getElementById('default-icon-contact-details');
    const $successIcon = document.getElementById('success-icon-contact-details');

    const $defaultTooltipMessage = document.getElementById('default-tooltip-message-contact-details');
    const $successTooltipMessage = document.getElementById('success-tooltip-message-contact-details');

    clipboard.updateOnCopyCallback((clipboard) => {
        showSuccess();

        // reset to default state
        setTimeout(() => {
            resetToDefault();
        }, 2000);
    })

    const showSuccess = () => {
        $defaultIcon.classList.add('hidden');
        $successIcon.classList.remove('hidden');
        $defaultTooltipMessage.classList.add('hidden');
        $successTooltipMessage.classList.remove('hidden');    
        tooltip.show();
    }

    const resetToDefault = () => {
        $defaultIcon.classList.remove('hidden');
        $successIcon.classList.add('hidden');
        $defaultTooltipMessage.classList.remove('hidden');
        $successTooltipMessage.classList.add('hidden');
        tooltip.hide();
    }
})
