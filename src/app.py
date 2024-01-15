from flask import Flask, render_template

app = Flask(
    __name__,
    static_folder="./public",
    static_url_path="/assets",
)


@app.route("/hello")
def hello_world():
    return "<p>Hello, World!</p>"


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run()
