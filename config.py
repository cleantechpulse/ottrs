class Config(object):
	ONETHREAD = True
	WEMO   = False
	HEROKU = False
	DEBUG = False
	TESTING = False
	CSRF_ENABLED = True
	ETHNETWORK = False

class HerokuConfig(Config):
	HEROKU      = True
	DEVELOPMENT = False
	DEBUG       = False
	ETHEREUM    = False
	ETHNETWORK  = False

class LocalWemo(Config):
	ONETHREAD = False
	WEMO = True
	DEVELOPMENT = True
	DEBUG       = True
	ETHEREUM    = False
	ETHNETWORK  = False	

class LocalNoEthereum(Config):
	DEVELOPMENT = True
	DEBUG       = True
	ETHEREUM    = False
	ETHNETWORK  = False

class LocalEthereumNoNetwork(Config):
	DEVELOPMENT = True
	DEBUG       = True
	ETHEREUM    = True
	ETHNETWORK  = False

class LocalEthereumNetwork(Config):
	ONETHREAD   = False
	DEVELOPMENT = True
	DEBUG       = True
	ETHEREUM    = True
	ETHNETWORK  = True