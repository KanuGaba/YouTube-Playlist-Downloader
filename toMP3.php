<?php
	$id = $_REQUEST['id'];
	$urlToCall = "http://www.youtubeinmp3.com/fetch/?format=JSON&video=http://www.youtube.com/watch?v=".$id;
	echo(file_get_contents($urlToCall));
?>