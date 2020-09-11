# Welcome to the RADON Framework for IaC Defect Prediction documentation

Modern software relies massively on the use of automation at both development and operations levels, and engineering strategy known as **DevOps**.
The software code driving such automations is collectively known as Infrastructure-as-Code (IaC).

While IaC represents an ever increasing widely-adopted practice nowadays,little is known how to best mantain, speedily evolve, and continuously improve the code behing the IaC strategy.

<div style="text-align:center"><span style="color:red; font-family:Georgia; font-size:1.25em;">
As any other source code artifact, IaC blueprints can be defect-prone!
</span></div>

<br>

The **RADON Framework for IaC Defect-Prediction** represents a step forward towards closing the gap for the implementation of software quality instruments to support DevOps engineers when developing and maintaining infrastructure code.
It provides functionality for quantifying the characteristic of a IaC blueprint and predicting its defect proneness.
Although it currently supports only Ansible, it is supposed to be soon extended to the OASIS Topology and Orchestration Specification for Cloud Applications (TOSCA) ecosystem. 

<div style="text-align:center"><span style="color:black; font-family:Georgia; font-size:1.25em;">
Accurate prediction of defect-prone IaC blueprints may enable DevOps to focus on such critical scripts duging Quality Assurance activities, and allocate effort and resources more efficiently!
</span></div>

<br>



## Getting Started

Set up the follownig environment variables:

* GITHUB_ACCESS_TOKEN - a Github's generated sha to query public repositories. Se how to generate a [personal access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token).
* MONGO_DB_NAME - the MongoDB database name where to save and retrieve the mined repositories (default: ```iac_miner```). 
* MONGO_DB_HOST - the MongoDB database host (default: ```localhost```).
* MONGO_DB_PORT - the MongoDB database port (default: ```27017```). 


Run server **TODO**

Go to ```http://127.0.0.1:8000/```.

### Mine Github

### Mine Repository