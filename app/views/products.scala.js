@(products: List[Product])

window.TriboxContest = window.TriboxContest || {};

TriboxContest.Products = [];
@for(product:Product <- products) {
    TriboxContest.Products[@product.product_id] = '@product.product_name';
}
