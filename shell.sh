
template="dist/index2.html"
components=(BannerContainer tetris)

for component in ${components[@]}
do
  echo "" >> $template
  cat "dist/$component.ug.js" >> $template
done