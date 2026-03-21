git add .
:: 如果没有更改则不提交，避免报错
git diff-index --quiet HEAD || git commit -m "Auto update blog:对.md文档进行更新"
git push