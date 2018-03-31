/*
 * Accrue.js
 * http://accruejs.com
 * Author: James Pederson (jpederson.com)
 * Licensed under the MIT, GPL licenses.
 * Version: 1.1.0
 *
 * Modified by A. Avetisov - AVA
 */


$( document ).ready(function() {
 // $("input#pseudorate").val( $("input.rate").val() + "%");
    $("input.rate").val( $("input#pseudorate").val() + "%");
    $("input#pseudorate").change(function() {
      $("input.rate").val( $("input#pseudorate").val() + "%");
    });

});

;(function( $, window, document, undefined ){

    // let's start our plugin logic
    $.extend($.fn, {
        accrue: function( options ){

            // set our options from the defaults, overriding with the
            // parameter we pass into this function.
            options = $.extend( { calculationMethod: calculateBasic }, $.fn.accrue.options, options );

            // Iterate through all the matching elements and return
            // the jquery object to preserve chaining.
            return this.each(function(){

                // Store a jQuery object for our element so we can use it
                // inside our other bindings.
                var elem = $(this);

                // Create the form div if it doesn't exist.
                if ( !elem.find(".form").length ) {
                    elem.append( '<div class="form"></div>' );
                }

                // Get the amount, rate(s), and term - and clean the values
                var amount = get_field( elem, options, "amount" );
                var rate = get_field( elem, options, "rate" );
                var term = get_field( elem, options, "term" );

                // If we're in comparison mode, grab an additiona field/value.
                if ( options.mode=="compare" ) {
                    var rate_compare = get_field( elem, options, "rate_compare" );
                }

                // If we are using the default results div and it doesn't exist, create it.
                var output_elem;
                if ( options.response_output_div === ".results" ) {

                    if ( elem.find(".results").length === 0 ) {
                        elem.append('<div class="results"></div>');
                    }

                    // Set the output div as a variable so we can refer to it more easily.
                    output_elem = elem.find(".results");

                } else {

                    // Set the output div as a variable so we can refer to it more easily.
                    output_elem = $(options.response_output_div);

                }


                // Set the calculation method based on which mode we're in.
                var calculation_method;
                switch ( options.mode ) {

                    case "basic":
                        calculation_method = calculateBasic;
                    break;

                    case "compare":
                        calculation_method = calculateComparison;
                    break;

                    case "amortization":
                        calculation_method = calculateAmortization;
                    break;

                }


                // Get the information about the loan.
                calculation_method( elem, options, output_elem );

                // Do some different things if the operation mode is "button"
                if ( options.operation=="button" ) {

                    // If we are using button operation mode and the button doesn't exist, create one.
                    if ( elem.find("button").length === 0 && elem.find("input[type=submit]").length === 0 && elem.find("input[type=image]").length === 0 ) {
                        elem.find(".form").append('<button class="accrue-calculate">'+options.button_label+'</button>');
                    }

                    // If the developer has chosen to bind to a button instead
                    // of operate on keyup, let's set up a click event binding
                    // that performs the calculation.
                    elem.find("button, input[type=submit], input[type=image]").each(function(){
                        $(this).click(function( event ){
                            event.preventDefault();
                            calculation_method( elem, options, output_elem );
                        });
                    });

                } else {

                    // Bind to the select and input elements so that we calculate
                    // on keyup (or change in the case of the select list).
                    elem.find("input, select").each(function(){
                        $(this).bind( "keyup change", function(){
                            calculation_method( elem, options, output_elem );
                        });
                    });

                }

                // If the developer has chosen to bind to a button instead
                // of operate on keyup, let's set up a click event binding
                // that performs the calculation.
                elem.find("form").each(function(){
                    $(this).submit(function(event){
                        event.preventDefault();
                        calculation_method( elem, options, output_elem );
                    });
                });

            });
        }
    });


    // DEFAULTS
    // Set up some default options for our plugin that can be overridden
    // as needed when we actually instantiate our plugin on a form.
    $.fn.accrue.options = {
        mode: "basic",
        operation: "keyup",
        default_values: {
            amount: "2000",
            rate: "12",
            rate_compare: "1.49%",
            term: "12m",
        },
        field_titles: {
            amount: "სესხის თანხა",
            rate: "% წლიური",
            rate_compare: "Comparison Rate",
            term: "ვადა (თვეები)"
        },
        button_label: "Calculate",
        field_comments: {
            amount: "",
            rate: "",
            rate_compare: "",
            term: "Format: 12m, 36m, 3y, 7y"
        },
        response_output_div: ".results",
        response_basic:
            '<p><strong>Monthly Payment:</strong><br />$%payment_amount%</p>'+
            '<p><strong>Number of Payments:</strong><br />%num_payments%</p>'+
            '<p><strong>Total Payments:</strong><br />$%total_payments%</p>'+
            '<p><strong>Total Interest:</strong><br />$%total_interest%</p>',
        response_compare: '<p class="total-savings">Save $%savings% in interest!</p>',
        error_text: '<p class="error">არასწორი მონაცემები.</p>',
        callback: function ( elem, data ){}
    };



    // GET FIELD
    // A function just for grabbing the value from a particular field.
    // We need this because if the field doesn't exist, the plugin will
    // create it for them.
    var get_field = function( elem, options, name ) {

        // Check for an input with a class of the name.
        var field;
        if ( elem.find(".accrue-"+name).length ) { // if has a class of accrue-[name]
            field = elem.find(".accrue-"+name);
        } else if ( elem.find("."+name).length ) { // if we have class of just the name
            field = elem.find("."+name);
        } else if ( elem.find( "input[name~="+name+"]" ).length ) {
            elem.find( "input[name~="+name+"]" );
        } else {
            field = "";
        }

        // If we have the field value, return it right away so that the
        // calculator doesn't write the field to the form div since we
        // don't need it to.
        if ( typeof( field ) !== "string" ) {
            return field.val();
        }

        if ( name == "term_compare" ) {
            return false;
        }

        /*
        if ( name == "rate" ) {
            return field.val()+ "%";
        }
        */



        // If we've gotten here, no fields were found that match the
        // criteria. Create the form field and return the default value.
        elem.find(".form").append(
            '<div class="accrue-field-'+name+'">'+
                '<p><label>'+options.field_titles[name]+':</label>'+
                '<input type="text" class="'+name+'" value="'+options.default_values[name]+'" />'+
                ( options.field_comments[name].length>0 ? "<small>"+options.field_comments[name]+"</small>" : '' )+'</p>'+
            '</div>');
        return elem.find("."+name).val();

    };



    // CALCULATE BASIC
    // for the basic calculation, we're just getting the values and
    // calculating loan info for a single loan.
    var calculateBasic = function( elem, options, output_elem ){

        // get the loan information from the current values in the form.
        var loan_info = $.loanInfo({
            amount: get_field( elem, options, "amount" ),
            rate: get_field( elem, options, "rate" ),
            term: get_field( elem, options, "term" ),
            grace: get_field( elem, options, "grace" ),
            ddate: get_field( elem, options, "ddate" ),
            pday: get_field( elem, options, "pday" ),
            expenditure: get_field( elem, options, "expenditure" )
        });


        alert(loan_info);
        // if valid, output into the output_elem that was passed into this function.
        if ( loan_info!==0 && loan_info!==1) {

            // replace the placeholders with the response values.
            var output_content = options.response_basic
                .replace( "%payment_amount%", loan_info.payment_amount_formatted )
                .replace( "%num_payments%", loan_info.num_payments )
                .replace( "%total_payments%", loan_info.total_payments_formatted )
                .replace( "%total_interest%", loan_info.total_interest_formatted );

            // output the content to the actual output element.
            output_elem.html( output_content );

        } else if(loan_info == 1){
            output_elem.html( 'sds' );
        }
        else {

            // if the values for the loan calculation aren't valid, provide an error.
            output_elem.html( options.error_text );
        }

        // run the callback function after the calculation is done, including
        // the calculation info so it's available in the callback.
        options.callback( elem, loan_info );
    };



    // CALCULATE COMPARE
    // The comparison mode gets 4 values from the form and calculates, then
    // compares two different loans to determine savings in interest.
    var calculateComparison = function( elem, options, output_elem ){

        // see if there's a comparison term
        var term_compare = get_field( elem, options, "term_compare" );

        // if the comparison term is empty, use the normal term field
        if ( typeof( term_compare ) == "boolean" ) {
            term_compare = get_field( elem, options, "term" );
        }

        // Get information about the two different loans in question
        // and create a callback data variable that we'll pass into
        // our callback function.
        var loan_1_info = $.loanInfo({
                amount: get_field( elem, options, "amount" ),
                rate: get_field( elem, options, "rate" ),
                term: get_field( elem, options, "term" )
            }),
            loan_2_info = $.loanInfo({
                amount: get_field( elem, options, "amount" ),
                rate: get_field( elem, options, "rate_compare" ),
                term: term_compare
            }),
            callback_data = {
                loan_1: loan_1_info,
                loan_2: loan_2_info
            };

        // If both loans are good, populate response element with info,
        // else error.
        if ( loan_1_info!==0 && loan_2_info!==0 ) {
            if ( loan_1_info.total_interest-loan_2_info.total_interest > 0 ) {
                callback_data.savings = loan_1_info.total_interest-loan_2_info.total_interest;
            } else {
                callback_data.savings = 0;
            }

            // replace our savings placeholder in the response text with
            // the real difference in interest.
            var output_content = options.response_compare
                .replace( "%savings%", callback_data.savings.toFixed(2) )
                .replace( "%loan_1_payment_amount%", loan_2_info.payment_amount_formatted )
                .replace( "%loan_1_num_payments%", loan_2_info.num_payments )
                .replace( "%loan_1_total_payments%", loan_2_info.total_payments_formatted )
                .replace( "%loan_1_total_interest%", loan_2_info.total_interest_formatted )
                .replace( "%loan_2_payment_amount%", loan_1_info.payment_amount_formatted )
                .replace( "%loan_2_num_payments%", loan_1_info.num_payments )
                .replace( "%loan_2_total_payments%", loan_1_info.total_payments_formatted )
                .replace( "%loan_2_total_interest%", loan_1_info.total_interest_formatted );
            output_elem.html( output_content );

        } else {

            // output an error
            output_elem.html( options.error_text );

        }

        // run the callback, passing our loan data into it.
        options.callback( elem, callback_data );
    };


    //***AVA*** caclulate difference between dates
    var _MS_PER_DAY = 1000 * 60 * 60 * 24;

    // a and b are javascript Date objects
    function dateDiffInDays(a, b) {
      // Discard the time and time-zone information.
      var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
      var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

      return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }



    // CALCULATE AMORTIZATION SCHEDULE
    // This method outputs a table with the repayment schedule
    // for a single loan object.
    var calculateAmortization = function( elem, options, output_elem ){

        // Get the loan information so we can build out our amortization
        // schedule table.
        var loan_info = $.loanInfo({
                amount: get_field( elem, options, "amount" ),
                rate: get_field( elem, options, "rate" ),
                term: get_field( elem, options, "term" ),
                grace: get_field( elem, options, "grace" ),
                ddate: get_field( elem, options, "ddate" ),
                pday: get_field( elem, options, "pday" ),
                expenditure: get_field( elem, options, "expenditure" )

            });

        // If the loan info's good, start buildin'!
        if ( loan_info!==0 && loan_info!==1 ) {

            // Set some initial variables for the table header, interest
            // per payment, amount from balance, and counter variables
            // to values as we list rows.
            var output_content = '<table class="accrue-amortization">'+
                    '<tr>'+
                    '<th class="accrue-payment-number">#</th>'+
                    '<th class="accrue-payment-date">{DATE}</th>'+
                    '<th class="accrue-payment-amount">{PMT}</th>'+
                    '<th class="accrue-total-interest">{RATE}</th>'+
                    '<th class="accrue-total-payments">{PERCENT}</th>'+
                    '<th class="accrue-balance">{BALANCE}</th>'+
                    '</tr>',
                interest_per_payment = loan_info.payment_amount-(loan_info.original_amount/loan_info.num_payments),
                amount_from_balance = loan_info.payment_amount-interest_per_payment,
                counter_interest = 0,
                counter_payment = 0,
                counter_balance = parseInt(loan_info.original_amount);


            var arr = [];
            //***AVA*** push for xirr
            arr.push({
                Date:  new Date(loan_info.ddate),
                Flow: (-loan_info.original_amount + parseInt(loan_info.expenditure))

            });

             console.log('Date: ' + loan_info.ddate + 'Flow : ' + (-loan_info.original_amount + parseInt(loan_info.expenditure)));


            //var pmt =  -PMT(loan_info.real_rate/12,(loan_info.num_payments - loan_info.grace),parseInt(loan_info.original_amount),0,0).toFixed(2);
            var pmt =  -PMT(loan_info.real_rate/12,(loan_info.num_payments - loan_info.grace),parseInt(loan_info.original_amount),0,0).toFixed(2);




            //var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            //nowDate.toLocaleDateString('de-DE', options);
            // Start appending the table rows to our output variable.
            for ( var i=0; i<loan_info.num_payments; i++) {

                //loan_info.num_payments  - months

                //***AVA*** % to bank
                //counter_payment = counter_payment+loan_info.payment_amount;
                //counter_payment = Math.round(counter_balance * loan_info.real_rate/12);
                //IF(AND(A20="";A18="");"";IF(AND(A20<>"";A18<>"");C2*$C$3/365*(B20-C6);IF(AND(A20="";A18<>"");SUM($E18:E$20);"")))

                // calculate dates
                if(i==0) {
                    var a = new Date(loan_info.ddate);
                    var b = new Date(loan_info.ddate);
                }
                else{
                    var a = new Date(theDate);
                    var b = new Date(theDate);
                }
                 var nextMonth = b.getMonth() + 1;
                 b.setMonth(nextMonth, loan_info.pday);




                 var  difference = dateDiffInDays(a, b);


               // alert(ldate.getDate());
                counter_payment = counter_balance * loan_info.real_rate/365*difference;

                var theDate = new Date(loan_info.ddate);

                //theDate.setFullYear(theDate.getFullYear()-2);
                //theDate.setDate(theDate.getDate()-10);
                var mmonth = theDate.getMonth() + i + 1;
                theDate.setMonth(mmonth,loan_info.pday);


                var dd = theDate.getDate();
                var mm = theDate.getMonth()+1;
                var yyyy = theDate.getFullYear();

                if(dd<10){
                    dd='0'+dd;
                }
                if(mm<10){
                    mm='0'+mm;
                }
                var payDate = dd+'/'+mm+'/'+yyyy;

                var n_pmt;
                if ((i+1)>loan_info.grace){
                    n_pmt = pmt;
                }
                else{
                    n_pmt = counter_payment.toFixed(2);
                }

                if( i == (loan_info.num_payments - 1)) {
                    n_pmt = (counter_balance + counter_payment).toFixed(2);
                    //counter_interest = parseInt(loan_info.original_amount);
                }

                //***AVA*** root
                // counter_interest = counter_interest+interest_per_payment;
                if(n_pmt > parseInt(loan_info.grace))
                  counter_interest = n_pmt - counter_payment;
                else
                  counter_interest = 0;

                //***AVA*** balanceshena
                //counter_balance = counter_balance-amount_from_balance;
                counter_balance = counter_balance - counter_interest;


                // bold the last row of the table by using <th>s for
                // the values.
                var cell_tag = "td";


                //***AVA*** push for xirr
                arr.push({
                    Date: theDate,
                    Flow: n_pmt
                });


//console.log(arr);


                // Append a row to the table
                output_content = output_content+
                    '<tr>'+
                    '<'+cell_tag+' class="accrue-payment-number">'+(i+1)+'</'+cell_tag+'>'+
                    '<'+cell_tag+' class="accrue-payment-date">'+payDate+'</'+cell_tag+'>'+
                    '<'+cell_tag+' class="accrue-payment-amount">'+n_pmt+'</'+cell_tag+'>'+
                    '<'+cell_tag+' class="accrue-total-interest">'+counter_interest.toFixed(2)+'</'+cell_tag+'>'+
                    '<'+cell_tag+' class="accrue-total-payments">'+counter_payment.toFixed(2)+'</'+cell_tag+'>'+
                    '<'+cell_tag+' class="accrue-balance">'+Math.ceil(counter_balance).toFixed(2)+'</'+cell_tag+'>'+
                    '</tr>';
            }

            // Finish off our table tag.
            output_content = output_content+
                '</table>';

            //console.log('xirr : ' + ExcelFormulas.XIRR(arr));
            var xirr = ExcelFormulas.XIRR(arr);

            // Push our output content into the output element.
            output_elem.html( output_content );
        }
        else if(loan_info == 1)
        {
            output_elem.html("");
        }
        else {

            // Values aren't good yet, show the error.
            output_elem.html( options.error_text );
        }

        // Execute callback, passing in loan information.
        options.callback( elem, loan_info );
        $('#shena').text($('td.accrue-payment-amount').first().text());
        if(xirr)
            $('#txirr').text((xirr * 100).toFixed(2) + '%');
    };



    // BASIC LOGGING FUNCTION
    // Checks to see if the console is available before outputting
    // anything through console.log(). Prevent issues with IE.
    var log = function( message ){
        if ( window.console ) {
            console.log( message );
        }
    };

    var PMT = function (rate_per_period, number_of_payments, present_value, future_value, type){
        if(rate_per_period != 0.0){
            // Interest rate exists
            var q = Math.pow(1 + rate_per_period, number_of_payments);
            return -(rate_per_period * (future_value + (q * present_value))) / ((-1 + q) * (1 + rate_per_period * (type)));

        } else if(number_of_payments != 0.0){
            // No interest rate, but number of payments exists
            return -(future_value + present_value) / number_of_payments;
        }

        return 0;
    };

    // GENERAL LOAN INFORMATION FUNCTION
    // This is the public function we use inside our plugin function
    // and we're exposing it here so that we can also provide generic
    // calculations that just return JSON objects that can be used
    // for custom-developed plugins.
    $.loanInfo = function( input ) {

        var amount = ( typeof( input.amount )!=="undefined" ? input.amount : 0 ).replace(/[^\d.]/ig, ''),
            rate = ( typeof( input.rate )!=="undefined" ? input.rate : 0 ).replace(/[^\d.]/ig, ''),
            term = ( typeof( input.term )!=="undefined" ? input.term : 0 ),
            grace = ( typeof( input.grace )!=="undefined" ? input.grace : 0 ).replace(/[^\d.]/ig, ''),
            ddate = ( typeof( input.ddate )!=="undefined" ? input.ddate : new Date() ),
            pday = ( typeof( input.pday )!=="undefined" ? input.pday : 1 ),
            expenditure = ( typeof( input.expenditure )!=="undefined" ? input.expenditure : 0 ).replace(/[^\d.]/ig, '');


        $('input.rate').attr('readonly', 'readonly');

        // parse year values passed into the term value
        if ( term.match("y") ) {
            term = parseInt( term.replace(/[^\d.]/ig, '') )*12;
        } else {
            term = parseInt( term.replace(/[^\d.]/ig, '') );
        }

        // process the input values
        var monthly_interest = rate / 100 / 12;
        var real_rate = rate/100;

        // Now compute the monthly payment amount.
        var x = Math.pow(1 + monthly_interest, term),
            monthly = (amount*x*monthly_interest)/(x-1);

        // If the result is a finite number, the user's input was good and
        // we have meaningful results to display
        if ( amount*rate*term>0 && grace <= term && grace >=0 && $.isNumeric(grace) && amount<=100000) {
            // Fill in the output fields, rounding to 2 decimal places
            return {
                original_amount: amount,
                payment_amount: monthly,
                payment_amount_formatted: Math.ceil(monthly).toFixed(2),
                num_payments: term,
                total_payments: ( monthly * term ),
                total_payments_formatted: ( monthly * term ).toFixed(2),
                total_interest: ( ( monthly * term ) - amount ),
                total_interest_formatted: ( ( monthly * term ) - amount ).toFixed(2),
                grace: grace,
                real_rate: real_rate,
                ddate: ddate,
                pday: pday,
                expenditure: expenditure
            };
        }
        else if(amount == 0){
            return 1;
        }
        else {
            // The numbers provided won't provide good data as results,
            // so we'll return 0 so it's easy to test if one of the fields
            // is empty or invalid.
            return 0;
        }
    };

})( jQuery, window, document );