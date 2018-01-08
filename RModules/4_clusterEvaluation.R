library(data.table)

getEnviromentVar<- function(tilda,name){
  readed.data<- fread(sprintf("%s/RModules/dataHolder/%s.csv",tilda,name),header = TRUE)
  return(readed.data)
}
setEnviromentVar <- function(data,tilda,name){
  write.csv(data,sprintf("%s/RModules/dataHolder/%s.csv",tilda,name),row.names = FALSE,col.names = names(data))  
}
getOctet <- function(number,col){
  if(number<=col[floor(length(col)/8)])
    return(1)
  else if(number<=col[floor(3*length(col)/8)])
    return(2)
  else if(number<=col[floor(5*length(col)/8)])
    return(3)
  else if(number<=col[floor(7*length(col)/8)])
    return(4)
  else
    return(5)
}

tilda=input[[1]]#"C:/Users/user/IdeaProjects/crmProject"#

newRFMClustered <- getEnviromentVar(tilda,"newRFM") #pipeline passing enviroment
newRFM <- newRFMClustered[,-5]

wss <- (nrow(newRFM)-1)*sum(apply(newRFM,2,var))
for (i in 2:20) wss[i] <- sum(kmeans(newRFM,
                                     centers=i)$withinss)
scaledWSS <- scale(wss)
k <- 0
for(i in 1:19){
  k <- k+1
  if(scaledWSS[i]-scaledWSS[i+1] < 0.1){
    break;
  }
}

newRFM <- newRFMClustered
#describe each cluster
desc <- list()
for (i in 1:k) desc[[i]]=0
for (i in 1:k){
  desc[[i]] <- (desc[[i]]*10)+getOctet(round(mean(newRFM[which(newRFM$Cluster==i),]$Recency)),newRFM[order(Recency)]$Recency)
  desc[[i]] <- (desc[[i]]*10)+getOctet(round(mean(newRFM[which(newRFM$Cluster==i),]$Frequency)),newRFM[order(Frequency)]$Frequency)
  desc[[i]] <- (desc[[i]]*10)+getOctet(round(mean(newRFM[which(newRFM$Cluster==i),]$Monetary)),newRFM[order(Monetary)]$Monetary)
}
output <- sprintf("%d",k)
for(i in 1:k) output<- sprintf("%s;%d",output,desc[[i]])
output
