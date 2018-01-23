library(data.table)
library(htmlwidgets)
library(plotly)
library(RColorBrewer)
library(sqldf)

getEnviromentVar<- function(tilda,name){
  readed.data<- fread(sprintf("%s/RModules/dataHolder/%s.csv",tilda,name),header = TRUE)
  return(readed.data)
}
setEnviromentVar <- function(data,tilda,name){
  write.csv(data,sprintf("%s/RModules/dataHolder/%s.csv",tilda,name),row.names = FALSE,col.names = names(data))  
}

testFun <- function(x){
  # 2 10 5
  return(as.numeric(input[[3]])*as.numeric(x$freq_type)+as.numeric(input[[4]])*as.numeric(x$mone_type)+as.numeric(input[[2]])*as.numeric(x$rec_type))
  #return(2*as.numeric(x$freq_type)+10*as.numeric(x$mone_type)+5*as.numeric(x$rec_type))
}

tilda=input[[1]]#"C:/Users/user/IdeaProjects/crmProject"#

newRFM <- getEnviromentVar(tilda,"newRFM") #pipeline passing enviroment
normal <- getEnviromentVar(tilda,"normal") #pipeline passing enviroment
wss <- (nrow(newRFM)-1)*sum(apply(newRFM,2,var))
for (i in 2:20) wss[i] <- sum(kmeans(newRFM,
                                     centers=i,nstart = 3)$withinss)
scaledWSS <- scale(wss)
k <- 0
for(i in 1:19){
  k <- k+1
  if(scaledWSS[i]-scaledWSS[i+1] < 0.1){
    break;
  }
}
segUsers<- kmeans(normal[,-1],centers = k,nstart = 3)
newRFM <- data.table(newRFM,Cluster=segUsers$cluster)
normal <- data.table(normal,Cluster=segUsers$cluster)
#groupMean(newRFM[,-1],newRFM$Cluster)
#groupMean(normal[,-1],normal$Cluster)

Sys.setenv(RSTUDIO_PANDOC=sprintf("%s/pandoc",tilda))#define PANDOC directory
 
cols<-brewer.pal(n=k,name="Set1")
cols_t1<-cols[normal$Cluster]
addr=sprintf("%s/public/plots",tilda)
dir.create(addr)
p<- plot_ly(normal, x = ~Recency , y = ~Frequency)
p<- add_markers(p,color =cols_t1)
htmlwidgets::saveWidget(p,file=sprintf("%s/fr.html",addr))
p<- plot_ly(normal, x = ~Monetary , y = ~Frequency)
p<- add_markers(p,color =cols_t1)
htmlwidgets::saveWidget(p,file=sprintf("%s/fm.html",addr))
p<- plot_ly(normal, x = ~Monetary , y = ~Recency)
p<- add_markers(p,color =cols_t1)
htmlwidgets::saveWidget(p,file=sprintf("%s/mr.html",addr))
query<- sprintf("SELECT
                User,
                case when Frequency <%d then 1
                when Frequency >=%d and Frequency <=%d then 2
                else 3 end as freq_type


                ,case when Monetary <%d then 1
                when Monetary >=%d and Monetary <=%d then 2
                else 3 end as mone_type


                ,case when Recency <%d then 3
                when Recency >=%d and Recency <=%d then 2
                else 1 end as rec_type
                ,Cluster
                FROM newRFM",2,2,3,30000,30000,75000,14,14,30)
binSet<- sqldf(query)
for (i in 1:nrow(binSet)) binSet$value[i] <- testFun(binSet[i,])

setEnviromentVar(binSet,tilda,"binset")
setEnviromentVar(newRFM,tilda,"newRFM")
setEnviromentVar(normal,tilda,"normal")
#rm(list = ls())