$(function () {
	$("#cashFlows").linedtextarea({
		selectedLine: -1
	}).focus();

	$('#npv, #irr').click(function () {
		var cashFlows = $('#cashFlows').val().split('\n');
		if (validate(cashFlows)) {
			var rate = parseFloat(coalesceNumber($('#rate').val(), 0.1)),
				result = window[$(this).attr('id')](cashFlows, rate);
			$('div.alert').removeClass('alert-danger')
						  .addClass('alert-primary')
						  .text('Result: ' + result)
						  .show();
		}
	});
});

function coalesceNumber(value, defaultValue) {
	return (isNaN(value) || value.trim() == '' ? defaultValue : value);
}

function validate(cashFlows) {
	var invalid = false;
	$('div.alert').hide();
	$('div.lineselect').removeClass('lineselect');
	for (var i = 0; i < cashFlows.length; i++) {
		if (coalesceNumber(cashFlows[i], true) === true) {
			$("div.lineno:contains('" + (i + 1) + "'):first").addClass('lineselect');
			invalid = true;
		} else if (!invalid) {
			cashFlows[i] = parseFloat(cashFlows[i]);
		}
	}
	if (invalid) {
		$('div.alert').addClass('alert-danger')
					  .removeClass('alert-primary')
					  .text('Invalid values')
					  .show();
	}
	return !invalid;
}

function npv(cashFlows, rate) {
	var result = 0,
		decimalPlaces = coalesceNumber($('#decimalPlaces').val(), 6),
		investmentAsIncome = ($('#investmentAsIncome').is(':checked') ? 1 : 0);
	for (var i = 0; i < cashFlows.length; i++) {
		result += (cashFlows[i] / Math.pow(1 + rate, i + investmentAsIncome));
	}
	return result.toFixed(decimalPlaces);
}

function irr(cashFlows) {
	var guess = 0,
		result = 0,
		decimalPlaces = coalesceNumber($('#decimalPlaces').val(), 6);
	for (var i = 1; i < (decimalPlaces + 1); i++) { // +1 for rounded values
		for (var a = 0; a < 15; a++) { // More iterations = More accuracy\time
			result = npv(cashFlows, guess);
			if (result > 0) {
				guess += parseFloat('0.' + new Array(i + 1).join('0') + '1');
			} else if (result < 0) {
				guess -= parseFloat('0.' + new Array(i + 1).join('0') + '1');
				break;
			} else {
				return guess.toFixed(decimalPlaces);
			}
		}
	}
	return guess.toFixed(decimalPlaces);
}