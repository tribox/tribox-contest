<?php

/**
 * アカウント認証用のリンクを書いたメールを送る
 *
 * Usage:
 *   php send-verifyingemail.php foo@tribox.jp ABCDEFGH contest.tribox.com
 */

if (count($argv) != 4) {
    exit("Invalid arguments\n");
}

date_default_timezone_set('Asia/Tokyo');
mb_language('ja');
mb_internal_encoding('UTF-8');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once('PHPMailer/src/Exception.php');
require_once('PHPMailer/src/PHPMailer.php');
require_once('PHPMailer/src/SMTP.php');

require_once('send-email-config.php');

// Prepare email contents
$to = $argv[1];
$token = $argv[2];
$domain = $argv[3];

$subject = 'アカウント認証のためのメールアドレス確認';
$body = $to . " 様\n\n"
      . "アカウント認証を完了するためにTORIBOコンテストにログイン済みのデバイス・Webブラウザで以下のURLにアクセスしてください。\n"
      . $domain . "/setting/verify/" . $token . "\n\n"
      . "TORIBOコンテスト\n"
      . $domain . "\n";

// Send an email using PHPMailer
$mailer = new PHPMailer(true);

$mailer->CharSet = 'UTF-8';
$mailer->SMTPDebug = 0;
$mailer->isSMTP();
$mailer->Host = MY_EMAIL_HOST;
$mailer->Port = MY_EMAIL_PORT;

$mailer->setFrom(MY_EMAIL_FROM_ADDRESS, mb_encode_mimeheader(MY_EMAIL_FROM_NAME));
$mailer->addAddress($to);
$mailer->addReplyTo(MY_EMAIL_FROM_ADDRESS);
$mailer->addCC(MY_EMAIL_FROM_ADDRESS);

$mailer->isHTML(false);
$mailer->Subject = mb_encode_mimeheader($subject);

$mailer->Body = $body;

if (!$mailer->send()) {
    echo 'Mailer Error: ' . $mailer->ErrorInfo . "\n";
} else {
    echo 'Message sent!' . "\n";
}
