<?php
echo $_SERVER["REQUEST_URI"] . "<br>";
// flash/php/test.php?user=James%20Newton
echo urlencode("James Newton") . "<br>";
// James+Newton
echo rawurlencode("James Newton") . "<br>";
// James%20Newton
echo urldecode($_GET["user"]);
// James Newton
?>