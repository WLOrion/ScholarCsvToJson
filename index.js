const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var fs = require('fs');

//  Try to open a file with name 'input.csv'
var my_input;
try 
{
    my_input = fs.readFileSync('input.csv', 'utf8').split("\r\n");
} 
catch (err) 
{
    console.error(err);
}

//  In input.csv double quotes compact information
//  and we need to treat it accordingly.
//
//  This function transformer itens inside doubles
//  quotes in the array
function rmQuotes(my_list)
{
    // Find all double quotes in the array
    let ini = [-1];
    let end = [-1];
    for(let i = 0; i< my_list.length; i++)
    {
        if (my_list[i][0] == "\"") 
            ini.push(i);
        if (my_list[i][my_list[i].length -1] == "\"")
            end.push(i);
    }

    // Check if has a even number of double quotes
    // to procced
    let ini_len = ini.length;
    let end_len = end.length;
    if (ini_len > 1 && end_len > 1 && ini_len == end_len)
    {
        for(let i = 1; i < ini_len; i++)
        {

            // Join itens inside doubles quotes in a string
            // to tranformer in a array
            let sum = "";
            for (let j = ini[i]; j <= end[i]; j++)
            {
                if (sum[sum.length - 1] == " " || my_list[j][0] == " ")
                    sum += my_list[j];
                else
                    sum += " " + my_list[j];
            }

            my_list.splice(ini[i] + 1, end[i] - ini[i]);
            my_list[ini[i]] = sum.split("\"")[1].split(" ");         
            
            for(let j = 0; j < Math.floor(my_list[ini[i]].length / 2); j++)
                my_list[ini[i]][2 * j] += " " + my_list[ini[i]][2 * j + 1];

            my_list[ini[i]] = my_list[ini[i]].filter(function(value, index, arr){ 
                return (index % 2) == 0;
            });
        }
    }
    return my_list;
}

// Set a phone number by only number
function setNumber(number)
{
    return phoneUtil.parseAndKeepRawInput(number, 'BR').values_[2];
}

//  Check if a variable is a string
function isString(any)
{
    return typeof any == "string";
}

//  Check if a variable is empty.
//
//  if yes, return true. Else, return the string.
function isEmpty(str)
{
    if(str == "")
        return true;
    else
        return str;
}

//  Check a array to see if exist empty iten inside it.
//
//  If all itens are empty, return true. Else, return
//  a array with only valid itens
function checkEmpty(arr)
{
    if(isString(arr))
    {
        return isEmpty(arr);
    }
    else
    {
        for(let i = 0; i < arr.length; i++)
        {
            if(isEmpty(arr[i]) === true)
            {
                arr.splice(i, 1);
                i--;
            }
        }
        if(arr.length > 0)
            return arr;
        else
            return true;
    }
}

//  Transforme a string with slash character in a list
//  , removing it.
function rmSlash(arr)
{
    for(let i = 0; i < arr.length; i++)
    {
        if(arr[i].includes("/"))
            arr[i] = arr[i].split("/").map(part => part.trim());
    }
    return arr;
}

//  Check all itens in a array to replace weird characters
//  to space
function rmWeirdChar(arr)
{
    for(let i = 0; i < arr.length; i++)
    {
        arr[i] = arr[i].replace(/[&\\#+()$~%':*?<>{}]/g, '').trim();
    }
    return arr;
}

//  Take the standarts key for all students
var headers = my_input[0].split(",");

//  Set partialy the students' data
var partial_output = [];
for(let i = 1; i < my_input.length; i++)
{
    partial_output.push(my_input[i].split(","));

    partial_output[i - 1] = rmWeirdChar(partial_output[i - 1]);

    partial_output[i - 1] = rmQuotes(partial_output[i - 1]);

    partial_output[i - 1] = rmSlash(partial_output[i - 1]);

    // Set the keys "invisible" and "see_all" properly
    for(let j = 0; j < 2; j++)
    {
        let aux = partial_output[i - 1][partial_output[i - 1].length - j - 1];

        if(aux == "" || aux == "no" || aux == "0")
            partial_output[i - 1][partial_output[i - 1].length - j - 1] = "false";

        else
            partial_output[i - 1][partial_output[i - 1].length - j - 1] = "true";
    }
}

//  Set the students' data for import to a output.json
var final_output = [];
for(let i = 0; i < partial_output.length; i++)
{
    let aux_dict = {};

    for (let j = 0; j < headers.length; j++)
    {
        //  Check if the next standart key is a phone number
        //  or a email
        if(!headers[j].includes(" "))
        {
            
            let new_value = checkEmpty(partial_output[i][j]);

            //  If the key has not appeared yet and is not empty
            if(aux_dict[headers[j]] == undefined && new_value !== true)
                aux_dict[headers[j]] =  new_value;

            //  If the key has appeared and is a valid string
            else if (isString(aux_dict[headers[j]]) && new_value !== true)
            {
                if(isString(new_value))
                    aux_dict[headers[j]] = [aux_dict[headers[j]], new_value];

                else
                {
                    aux_dict[headers[j]] = [aux_dict[headers[j]]];
                    for(let k = 0; k < new_value.length; k++)
                        aux_dict[headers[j]].push(new_value[k]);
                }
            }

            //  If the key has appeared and is a array
            else if(new_value !== true)   
            {
                if(isString(new_value))
                    aux_dict[headers[j]].push(new_value);

                else
                {
                    for(let k = 0; k < new_value.length; k++)
                        aux_dict[headers[j]].push(new_value[k]);
                }
            }
        }
        else
        {   
            //  If is a phone or email, the standart key will come
            //  with tags to differentiate parents and students

            let aux_head = 0;

            if(headers[j].includes("\""))
                aux_head = headers[j].split("\"")[1].split(" ");

            else 
                aux_head = headers[j].split(" ");

            //  Try to set a possibly phone number
            let seted_number = 0;
            try
            {
                seted_number = setNumber(partial_output[i][j]);
                if(seted_number.toString().length != 11)
                    seted_number = -1;
            }
            catch(err)
            {
                seted_number = -1;
            }
            
            //  The new key "addresses" will contain all emails
            //  and phone number related to the student

            //  Set a email in the key "addresses" 
            if(aux_head[0] == "email" && partial_output[i][j] != "")
            {
                let dicionario_especifico = {
                    "type": aux_head[0],
                    "tags" : aux_head.splice(1),
                    "address" : partial_output[i][j]
                };

                if(aux_dict["addresses"] == undefined)
                    aux_dict["addresses"] = [dicionario_especifico];

                else
                {
                    aux_dict["addresses"] = aux_dict["addresses"].concat(dicionario_especifico);
                }
            }

            //  Set a email in the key "addresses"
            else if(aux_head[0] == "phone" && seted_number != -1 && partial_output[i][j] != "")
            {                
                let dicionario_especifico = {
                    "type": aux_head[0],
                    "tags" : aux_head.splice(1),
                    "address" : "55" + seted_number
                };

                if(aux_dict["addresses"] == undefined)
                    aux_dict["addresses"] = [dicionario_especifico];

                else
                {
                    aux_dict["addresses"] = aux_dict["addresses"].concat(dicionario_especifico);
                }
            }
        }  
    }

    final_output.push(aux_dict);
}

//  Write the data formatted to JSON formate
fs.writeFileSync("output.json", JSON.stringify(final_output, null, 2), 'utf8');
