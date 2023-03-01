<?php

/**
 * テストメールを送る。ローカルのpostfix経由で送る。
 * TODO: node.js 内のモジュールで送るようにしたい。
 *
 * Usage:
 *   php send-testemail.php foo@tribox.jp
 */

if (count($argv) != 2) {
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

// Prepare email contents
$to = $argv[1];

$subject = 'サーバーからのテストメール';
$body = $to . " 様\n\n"
      . "サーバーからのテストメールです。\n\n"
      . "TORIBOコンテスト\n";

// Send an email using PHPMailer
$mailer = new PHPMailer(true);

$mailer->CharSet = 'UTF-8';
$mailer->SMTPDebug = 0;
$mailer->isSMTP();
$mailer->Host = 'localhost';
$mailer->Port = 25;

$mailer->setFrom('support@tribox.jp', mb_encode_mimeheader('TORIBO Contest'));
$mailer->addAddress($to);
$mailer->addReplyTo('support@tribox.jp');
$mailer->addCC('support@tribox.jp');

$mailer->isHTML(false);
$mailer->Subject = mb_encode_mimeheader($subject);

$mailer->Body = $body;

if (!$mailer->send()) {
    echo 'Mailer Error: ' . $mail->ErrorInfo;
} else {
    echo 'Message sent!';
}
