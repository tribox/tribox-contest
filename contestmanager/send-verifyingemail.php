<?php

/**
 * アカウント認証用のリンクを書いたメールを送る
 *
 * Usage:
 *   php send-verifyingemail.php foo@tribox.jp ABCDEFGH contest.tribox.com
 */

//var_dump($argv);
if (count($argv) != 4) {
    exit("Invalid arguments\n");
}

mb_language('ja');
mb_internal_encoding('UTF-8');

$to = $argv[1];
$token = $argv[2];
$domain = $argv[3];

$header = 'From:' . mb_encode_mimeheader('tribox Contest') . '<support@tribox.jp>' . "\n"
                  . 'Cc: support@tribox.jp' . "\n"
                  . 'Reply-to: support@tribox.jp';
$subject = 'アカウント認証のためのメールアドレス確認';
$body = $to . " 様\n\n"
      . "アカウント認証を完了するために以下のURLにアクセスしてください。\n"
      . $domain . "/setting/verify/" . $token . "\n\n"
      . "triboxコンテスト\n"
      . $domain . "\n";
$res = mb_send_mail($to, $subject, $body, $header);
