export const $datapicker = $( "#Birthday" );

export function Datapicker() {
    $datapicker.datepicker({
        changeMonth: true,
        changeYear: true
    });
}
