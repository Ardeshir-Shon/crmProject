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

tilda=input[[1]]

transactions <- fread(file=sprintf("%s/trans-df.csv",tilda),header = TRUE)
transactions <- transactions[order(userID)]
RFM <- extractRFM(transactions)
RFM <- setnames(RFM,c("userID","N"),c("User","Frequency"))
transactionPayMean <- mean(transactions$amount)
setEnviromentVar(RFM,tilda,"rfm")