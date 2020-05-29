# Welcome to the Receptor documentation

Modern software relies massively on the use of automation at both development and operations levels, and engineering strategy known as **DevOps**.
The software code driving such automations is collectively known as Infrastructure-as-Code (IaC).

While IaC represents an ever increasing widely-adopted practice nowadays,little is known how to best mantain, speedily evolve, and continuously improve the code behing the IaC strategy.

<div style="text-align:center"><span style="color:red; font-family:Georgia; font-size:1.25em;">
As any other source code artifact, IaC blueprints can be defect-prone!
</span></div>

<br>

**Receptor** represents a step forward towards closing the gap for the implementation of software quality instruments to support DevOps engineers when developing and maintaining infrastructure code.
It provides functionality for quantifying the characteristic of a IaC blueprint and predicting its defect proneness.
Although it currently supports only Ansible, it is supposed to be soon extended to the OASIS Topology and Orchestration Specification for Cloud Applications (TOSCA) ecosystem. 

<div style="text-align:center"><span style="color:black; font-family:Georgia; font-size:1.25em;">
Effective prediction of defect-prone IaC blueprints may enable DevOps to focus on such critical scripts duging Quality Assurance activities, and allocate effort and resources more efficiently!
</span></div>

<br>

Ultimately, this enables continuous deloyment and accelerates the expected Return on Investment.



## How to build and run

Installation is made simple by the Docker technology.
Clone the repository and run the following command within the project folder:

```
docker build -t radon-dp:latest .
```

then run it with

```
docker run -p 5000:5000 radon-dp:latest
```


## How to use

You can test the **/classify** API as follows:

```
curl -X POST "http://localhost:5000/api/classification/classify" -H  "accept: */*" -H  "Content-Type: plain/text" -d "- host: all"
```

## Related tools

* AnsibleMetrics: [AnsibleMetrics](https://radon-h2020.github.io/radon-ansible-metrics/) is a tool to quantify the characteristic of infrastructure code used by the defect predictor to extract metrics from an Ansible blueprint and use them for the detection of defects.

* Visual Studio Extension: available on the VSC Marketplace at this [link](https://marketplace.visualstudio.com/items?itemName=sdallapalma.radon-defect-predictor).
