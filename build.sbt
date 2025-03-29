name := """contest"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.13.16"

libraryDependencies ++= Seq(
  jdbc,
  //cache,
  ws,
  //"org.scalatestplus.play" %% "scalatestplus-play" % "1.5.1" % Test,
  "mysql" % "mysql-connector-java" % "5.1.34",
  "org.xerial" % "sqlite-jdbc" % "3.49.1.0",
  "org.playframework.anorm" %% "anorm" % "2.7.0",
  guice
)

resolvers += "scalaz-bintray" at "https://dl.bintray.com/scalaz/releases"
