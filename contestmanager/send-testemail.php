<?php

/**
 * テストメールを送る
 *
 * Usage:
 *   php send-testemail.php foo@tribox.jp
 */

//var_dump($argv);
if (count($argv) != 2) {
    exit("Invalid arguments\n");
}

mb_language('ja');
mb_internal_encoding('UTF-8');

$to = $argv[1];

$header = 'From:' . mb_encode_mimeheader('TORIBO Contest') . '<support@tribox.jp>' . "\n"
                  . 'Cc: support@tribox.jp' . "\n"
                  . 'Reply-to: support@tribox.jp';
$subject = 'サーバーからのテストメール';
$body = $to . " 様\n\n"
      . "サーバーからのテストメールです。\n\n"
      . "TORIBOコンテスト\n";
$res = mb_send_mail($to, $subject, $body, $header);
