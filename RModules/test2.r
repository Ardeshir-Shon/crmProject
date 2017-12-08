# input = C:/Users/user/IdeaProjects/crmProject
library(data.table)

getEnviromentVar<- function(name){
  readed.data<- fread(sprintf("%s/RModules/dataHolder/%s.csv",input[[1]],name),header = TRUE)
  return(readed.data)
}
setEnviromentVar <- function(data,name){
  write.csv(dt,sprintf("%s/RModules/dataHolder/%s.csv",input[[1]],name),row.names = FALSE,col.names = names(data))  
}
gb <- c(1,2,3);
kd <- c("a","b","c")
dt <- data.table(gb,kd)
setEnviromentVar(dt,"myData")
readed_dt <- getEnviromentVar("myData")


