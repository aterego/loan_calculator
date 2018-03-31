<?php
$lang = 'en';
$topurl=$_SERVER['HTTP_REFERER'];
$q=substr($topurl,strpos($topurl,'=')+1);

if (strpos($q, '/en/') !== false || strpos($q, 'lang=en')) {
    $lang = 'en';
}
else{
    $lang = 'ge';
}
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>TBILMICROCREDIT</title>

    <link href="css/main.css" rel="stylesheet">
    <link href="css/style.css" rel="stylesheet">
    <link href="css/jquery-ui.min.css" rel="stylesheet">
    <script src="js/jquery.min.js"></script>
    <script src="js/ExcelFormulas.js"></script>
    <script src="js/jquery.accrue.js"></script>
    <script src="js/jquery-ui.min.js"></script>


    <?php
    if($lang =='en') {
    ?>
        <script src="js/datepicker-en-GB.js"></script>

    <?php
    }
    else {
    ?>
        <script src="js/datepicker-ka.js"></script>
        <script>

      $.datepicker.setDefaults(
          $.extend(
           // {'dateFormat':'dd/mm/yy'},
            $.datepicker.regional['ka']
          )
        );

      </script>
    <?php
    }
    ?>


     <script>
      $( function() {
        $( "#datepicker" ).datepicker({ minDate: 0, maxDate: "+1M +10D" });
        $("#datepicker").datepicker().datepicker("setDate", new Date());
        $("#datepicker").datepicker($.datepicker.regional["ka"]);

      } );

    </script>




</head>
<body>

<?php



if($lang=='en') {
    define("PAYMENT", "Payment");
    define("XIRR", "Effective interest rate");
    define("AMOUNT", "Loan Amount");
    define("YEAR_PAYMENT", "% per year");
    define("TERM", "Term (months)");
    define("GRACE", "Grace Period (months)");
    define("ISSUE_DATE", "Date of issue");
    define("PAYMENT_DAY", "Payment day");
    define("MONTH", "Month");
    define("MONTHS", "Months");
    define("EXPENDITURE", "Expenditure");

    define("DATE_A", "Date");
    define("PMT_A", "Payment");
    define("RATE_A", "Rate");
    define("PERCENT_A", "%");
    define("BALANCE_A", "Balance");
    define("PRINT_A", "Print");

}
else{
    define("PAYMENT", "შენატანი");
    define("XIRR", "ეფექტური საპროცენტო განაკვეთი");
    define("AMOUNT", "სესხის თანხა");
    define("YEAR_PAYMENT", "% წლიური");
    define("TERM", "ვადა (თვეები)");
    define("GRACE", "საშეღავათო პერიოდი (თვე)");
    define("ISSUE_DATE", "გაცემის თარიღი");
    define("PAYMENT_DAY", "გადახდის რიცხვი");
    define("MONTH", "თვე");
    define("MONTHS", "თვე");
    define("EXPENDITURE", "ხარჯი");

    define("DATE_A", "თარიღი");
    define("PMT_A", "შენატანი");
    define("RATE_A", "ძირი");
    define("PERCENT_A", "%");
    define("BALANCE_A", "ნაშთი");
    define("PRINT_A", "ბეჭდვა");
}
?>

<div style="padding: 10px; margin: 0 auto">
<div class="calculator-amortization">
    <div class="form" style="background: #970200;">
        <table class = "calc" border="0" width="100%">
            <tr  >
                <td rowspan="4" style="padding-right: 30px; width: 200px"><img src="images/logo.png" width="150" /> </td>
                <td width="150">
                    <?php echo AMOUNT;?>
                </td>
                <td >
                    <input type="text" class="amount" value="">
                </td>
                <td align="right" rowspan="6" style=" text-align: right; color: #ffcf71;">
                    <div style="position: relative; right: 0; padding-bottom: 20px"><?php echo PAYMENT;?>:<br><div id="shena"></div></div>
                    <div style="position: relative; right: 0"><?php echo XIRR;?>:<br><div id="txirr"></div></div>
                </td>

            </tr>

            <tr >
                <td>
                    <?php echo YEAR_PAYMENT;?>
                </td>
                <td>
                    <input type="text"  class="rate"  style="display: none">
                    <input type="number" min="10" max="100" id="pseudorate" value="12" step="0.1" style=" text-align: right; color: black; width: 95px">
                </td>

            </tr>
            <tr>
                <td>
                    <?php echo TERM; ?>
                </td>
                <td>
        <select class="term">

            <?php
            for($mi=1; $mi<121; $mi++) {
                if($mi==1) {
            ?>
                <option value="<?php echo $mi;?>m"><?php echo $mi;?> <?php echo MONTH;?></option>
            <?php
                }
                elseif($mi == 12){
            ?>
                <option value="12m" selected>12 <?php echo MONTHS;?></option>
            <?php
                }
                else{
            ?>
                <option value="<?php echo $mi;?>m"><?php echo $mi;?> <?php echo MONTHS;?></option>
            <?php
                }
            }
            ?>

        </select>
                </td>
            </tr>
            <tr>
                <td>
                    <?php echo GRACE; ?>
                </td>
                <td>
                    <input type="text" class="grace" value="0">
                </td>
            </tr>
            <tr>
                <td>
                    <?php echo ISSUE_DATE;?>
                </td>
                <td >
                    <input type="text" class="ddate" id="datepicker" value="">
                </td>
            </tr>
            <tr >
                <td>
                    <?php echo PAYMENT_DAY; ?>
                </td>
                <td>
                    <input type="number" min="1" max="31" class="pday" id="pday" value="1" step="1" style=" text-align: right; color: black; width: 95px">
                </td>
            </tr>
            <tr >
                <td>
                    <?php echo EXPENDITURE; ?>
                </td>
                <td>
                    <input type="text" class="expenditure" value="0">
                </td>
            </tr>
        </table>
    </div>

    <div class="seventy" >

        <div style="padding: 0 5px; float: right" id="Prnt"  onclick="Print()" ><span class="printer"  style="margin-right: 7px"><?php echo PRINT_A; ?></span><span class="printer"><img src="images/print.png" onclick="Print()"></span> </div>

        <div class="results" id="tbl" style="width: 100%">



        </div>
    </div>

    <div class="clear"></div>
</div>

</div>

<script>



    function Print()
    {

        var title = document.title;
        var divElements = document.getElementById('tbl').innerHTML;

        var printWindow = window.open("", "_blank", 'height=600,width=800');
        //open the window
        printWindow.document.open();
        //write the html to the new window, link to css file
        printWindow.document.write('<html><head><title>' + title + '</title>');
        printWindow.document.write('<link href="css/main.css" rel="stylesheet">');
        printWindow.document.write('<link href="css/style.css" rel="stylesheet">');
        printWindow.document.write('<link href="css/jquery-ui.min.css" rel="stylesheet">');
        printWindow.document.write('</head><body>');
        printWindow.document.write(divElements);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();

        //The Timeout is ONLY to make Safari work, but it still works with FF, IE & Chrome.
        setTimeout(function() {
            printWindow.print();
            printWindow.close();
        }, 100);


        return true;
    }


    jQuery(document).ready(function(){
        jQuery(".calculator-amortization").accrue({
            mode: "amortization"

        });

       jQuery('#Prnt').css('visibility','hidden');
    });


    jQuery(".calculator-amortization").bind( "keyup change", function(){


         if($('input.amount').val()!='' && $.isNumeric($('input.amount').val())) {
                $('#Prnt').css('visibility', 'visible');
         }
         else {
                $('#Prnt').css('visibility', 'hidden');
         }


        $(".accrue-amortization th").each(function() {

            var text = $(this).text();



            switch(text) {
                case '{DATE}':
                    text = '<?php echo DATE_A; ?>';
                    break;
                case '{PMT}':
                    text = '<?php echo PMT_A; ?>';
                    break;
                case '{RATE}':
                    text = '<?php echo RATE_A; ?>';
                    break;
                case '{PERCENT}':
                    text = '<?php echo PERCENT_A; ?>';
                    break;
                case '{BALANCE}':
                    text = '<?php echo BALANCE_A; ?>';
                    break;
                default:
                    text = text;
            }
            //text = text.replace("{DATE}", "<?php echo DATE_A; ?>");

            $(this).text(text);
        });

    });

</script>




</body>
</html>