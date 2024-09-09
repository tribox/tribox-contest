window.TriboxContest = window.TriboxContest || {};
TriboxContest.Products = [];

[% for product in products %]
TriboxContest.Products[[[ product[0] ]]] = [[ product[1] | tojson]];
[%- endfor %]
