window.addEventListener('load', function() {
    const clipboard = FlowbiteInstances.getInstance('CopyClipboard', 'phone-numbers');
    const tooltip = FlowbiteInstances.getInstance('Tooltip', 'tooltip-phone');

    const $defaultIcon = document.getElementById('copy-icon');
    const $successIcon = document.getElementById('copy-icon-success');

    const $defaultTooltipMessage = document.getElementById('tooltip-text');
    const $successTooltipMessage = document.getElementById('tooltip-text-success');

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
});
