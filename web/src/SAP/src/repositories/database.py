import os, sys
import binascii

from pymongo import MongoClient
from pymongo.encryption import (Algorithm,
                                ClientEncryption)
from pymongo.encryption_options import AutoEncryptionOpts

CONNECTION = None
CLIENT_ENC = None
hostname = "bifrost_db"
rset = "rs0"
dbname = "bifrost_test"
SAP_BIFROST_ENCRYPTION_NAMESPACE = os.environ.get("SAP_BIFROST_ENCRYPTION_NAME", "encryption.__sap_pymongo.sap_pii")
ENCRYPTION_DB, ENCRYPTION_COL, ENCRYPTION_KEY_NAME = SAP_BIFROST_ENCRYPTION_NAMESPACE.split(".", 2)


# The MongoClient is thread safe and pooled, so no problem sharing it :)
def get_connection(with_enc=False):
    """
    Returns instance of global pooled connection.
    The connection instance has automatic decryption enabled.
    -> MongoClient
    If with_enc=True this returns a ClientEncryption used for encryption fields along the connection
    -> MonogClient, ClientEncryption
    """
    global CONNECTION
    global CLIENT_ENC
    if CONNECTION is not None and CLIENT_ENC is not None:
        if with_enc:
            return CONNECTION, CLIENT_ENC
        else:
            return CONNECTION

    else:
        # Key must be 96 bytes
        local_master_key_raw = os.environ["SAP_BIFROST_ENCRYPTION_KEY"]
        local_master_key = binascii.a2b_base64(local_master_key_raw.encode())

        kms_providers = {"local": {"key": local_master_key}}
        # The MongoDB namespace (db.collection) used to store
        # the encryption data keys.
        key_vault_db_name, key_vault_coll_name, key_name = ENCRYPTION_DB, ENCRYPTION_COL, ENCRYPTION_KEY_NAME

        # bypass_auto_encryption=True disable automatic encryption but keeps
        # the automatic _decryption_ behavior. bypass_auto_encryption will
        # also disable spawning mongocryptd.
        auto_encryption_opts = AutoEncryptionOpts(
            kms_providers, key_vault_namespace, bypass_auto_encryption=True)

        client = MongoClient(hostname, replicaset=rset, auto_encryption_opts=auto_encryption_opts)
        coll = client.test.coll

        # First time key setup
        key_vault = client[key_vault_db_name][key_vault_coll_name]
        key_vault.create_index(
            "keyAltNames",
            unique=True,
            partialFilterExpression={"keyAltNames": {"$exists": True}})

        client_encryption = ClientEncryption(
            kms_providers,
            key_vault_namespace,
            # The MongoClient to use for reading/writing to the key vault.
            # This can be the same MongoClient used by the main application.
            client,
            # The CodecOptions class used for encrypting and decrypting.
            # This should be the same CodecOptions instance you have configured
            # on MongoClient, Database, or Collection.
            coll.codec_options)

        existing = client[key_vault_db_name][key_vault_coll_name].find_one()
        if existing == None:
            data_key_id = client_encryption.create_data_key(
                    'local', key_alt_names=[key_name])
        else:
            data_key_id = existing["_id"]
"""
# Example of usage:

        encrypted_field = client_encryption.encrypt(
            "123456789",
            Algorithm.AEAD_AES_256_CBC_HMAC_SHA_512_Deterministic,
            key_alt_name=key_name)

        coll.insert_one({"encryptedField": encrypted_field})
        # Automatically decrypts any encrypted fields.
        doc = coll.find_one()
        print('Decrypted document: %s' % (doc,))
        unencrypted_coll = MongoClient(hostname, replicaset=rset).test.coll
        print('Encrypted document: %s' % (unencrypted_coll.find_one(),))
   """     

        CONNECTION = client
        CLIENT_ENC = client_encryption
        if with_enc:
            return CONNECTION, CLIENT_ENC
        else:
            return CONNECTION