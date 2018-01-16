#.libPaths(sprintf("%s/lib",input[[1]]))
library(data.table)

getEnviromentVar<- function(tilda,name){
  readed.data<- fread(sprintf("%s/RModules/dataHolder/%s.csv",tilda,name),header = TRUE)
  return(readed.data)
}
setEnviromentVar <- function(data,tilda,name){
  write.csv(data,sprintf("%s/RModules/dataHolder/%s.csv",tilda,name),row.names = FALSE,col.names = names(data))  
}

extractRFM <- function(transaction_list){
  return(
    data.table(transaction_list[,.N,by=userID],
               Monetary=transaction_list[,.(totalPay=sum(amount)),by=userID]$totalPay,
               Recency=transaction_list[,.(rec=min(diffDate)),by=userID]$rec)
  )
}

normalization <- function(dt){
  out <- as.data.table(scale(dt[,-1]))
  out <- data.table(User=dt$User,out)
  head(out)
  out <- out[Frequency<3 & Frequency>-3 & Monetary<3 & Monetary>-3 & Recency<3 & Recency>-3]
  
  return(out)
}

tilda=input[[1]]#"C:/Users/user/IdeaProjects/crmProject"#

RFM <- getEnviromentVar(tilda,"rfm") #pipeline passing enviroment
normal <- normalization(RFM)
newRFM<- merge(RFM,normal,by="User")
newRFM <- newRFM[,-c(5,6,7)]
setnames(newRFM,c("Frequency.x","Recency.x","Monetary.x"),c("Frequency","Recency","Monetary"))
setEnviromentVar(newRFM,tilda,"newRFM")
setEnviromentVar(normal,tilda,"normal")
output<- sprintf("%d;%d;%d;%d;%d;%d",min(newRFM$Recency),max(newRFM$Recency),min(newRFM$Frequency),max(newRFM$Frequency),min(newRFM$Monetary),max(newRFM$Monetary))
output
#rm(list = ls())